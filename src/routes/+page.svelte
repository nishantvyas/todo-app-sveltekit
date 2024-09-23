<script lang="ts">
    // Import necessary Svelte and custom components
    import { onMount } from 'svelte';
    import { pb } from '$lib/pocketbase';
    import type { Todo } from '$lib/types';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';

    // Initialize state variables
    let todos: Todo[] = [];
    let newTodoText = '';
    let loading = true;
    let error = '';
    let sortField: 'created' | 'updated' | null = null;
    let sortDirection: 'asc' | 'desc' = 'desc';

    // Fetch todos on component mount
    // This function runs when the component is first mounted to the DOM
    // It retrieves the full list of todos from the PocketBase 'todos' collection
    // and updates the local state accordingly
    onMount(async () => {
        await fetchTodos();
    });

    async function fetchTodos() {
        try {
            const records = await pb.collection('todos').getFullList<Todo>({
                filter: 'isDeleted = false',
                sort: sortField ? `${sortDirection === 'desc' ? '-' : ''}${sortField}` : '-created'
            });
            todos = records;
        } catch (e) {
            error = 'Failed to load todos';
            console.error('Error fetching todos:', e);
        } finally {
            loading = false;
        }
    }

    // Function to add a new todo
    async function addTodo() {
        if (newTodoText.trim()) {
            try {
                const newTodo = await pb.collection('todos').create<Todo>({
                    text: newTodoText,
                    completed: false
                });
                todos = [newTodo, ...todos];
                newTodoText = '';
            } catch (e) {
                error = 'Failed to add todo';
            }
        }
    }

    // Function to toggle todo completion status
    async function toggleTodo(todo: Todo) {
        try {
            const updatedTodo = await pb.collection('todos').update<Todo>(todo.id, {
                completed: !todo.completed
            });
            todos = todos.map(t => t.id === updatedTodo.id ? updatedTodo : t);
        } catch (e) {
            console.error('Failed to update todo:', e);
            error = 'Failed to update todo';
        }
    }

    // Update the function name from markTodoAsDeleted to deleteTodo
    async function deleteTodo(id: string) {
        try {
            await pb.collection('todos').update(id, {
                isDeleted: true
            });
            // Remove the item from the local state
            todos = todos.filter(t => t.id !== id);
        } catch (e) {
            error = 'Failed to delete todo';
            console.error('Error marking todo as deleted:', e);
        }
    }

    // Function to sort todos
    function sortTodos(field: 'created' | 'updated') {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'desc';
        }
        fetchTodos();
    }

    // Function to format dates
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString();
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Todo App</h1>
    
    <!-- Display error message if any -->
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span class="block sm:inline">{error}</span>
        </div>
    {/if}

    <!-- Form to add new todo -->
    <form on:submit|preventDefault={addTodo} class="flex gap-2 mb-4">
        <Input type="text" bind:value={newTodoText} placeholder="Add a new todo" />
        <Button type="submit">Add</Button>
    </form>

    <!-- Display todos or loading message -->
    {#if loading}
        <p>Loading todos...</p>
    {:else}
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Todo</TableHead>
                    <TableHead class="cursor-pointer" on:click={() => sortTodos('created')}>
                        Created {sortField === 'created' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead class="cursor-pointer" on:click={() => sortTodos('updated')}>
                        Modified {sortField === 'updated' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#each todos as todo (todo.id)}
                    <TableRow>
                        <TableCell>
                            <Checkbox 
                                checked={todo.completed} 
                                onCheckedChange={() => toggleTodo(todo)} 
                            />
                        </TableCell>
                        <TableCell>
                            <span class:line-through={todo.completed}>{todo.text}</span>
                        </TableCell>
                        <TableCell>{formatDate(todo.created)}</TableCell>
                        <TableCell>{formatDate(todo.updated)}</TableCell>
                        <TableCell>
                            <Button variant="destructive" size="sm" on:click={() => deleteTodo(todo.id)}>Delete</Button>
                        </TableCell>
                    </TableRow>
                {:else}
                    <TableRow>
                        <TableCell colspan="5">No todos yet. Add one above!</TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
</div>
