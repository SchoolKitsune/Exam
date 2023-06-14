document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#myExercises tbody');
    const templateRow = document.querySelector('#templateRow');

    // Function to handle delete button click
    const handleDelete = (exerciseId) => {
        fetch('/exercise/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: exerciseId })
        })
        .then(response => {
            if (response.ok) {
                // Reload the page after successful deletion
                location.reload();
            } else {
                console.error('Error deleting exercise');
            }
        })
        .catch(error => {
            console.error('Error deleting exercise:', error);
        });
    };

    // Fetch data from the server and populate the table
    fetch('/exercise')
        .then(response => response.json())
        .then(data => {
            data.forEach(rowData => {
                const row = templateRow.cloneNode(true);
                row.removeAttribute('id');
                row.removeAttribute('style');

                const cells = row.querySelectorAll('td');
                cells[0].textContent = rowData.name;
                cells[1].textContent = rowData.sets;
                cells[2].textContent = rowData.reps;
                cells[3].textContent = rowData.maxRep;
                cells[4].textContent = rowData.weight;

                // Add even listeners to the edit and delete buttons
                const editButton = row.querySelector('.edit-btn');
                editButton.addEventListener('click', () => {
                    // Get the row data for the clicked row
                    const name = rowData.name;
                    const sets = rowData.sets;
                    const reps = rowData.reps;
                    const maxRep = rowData.maxRep;
                    const weight = rowData.weight;
                    
                    // Perform any desired actions, such as opening a modal or navigating to an edit page,
                    // passing the row data as parameters or updating form fields with the data.
                });

                const deleteButton = row.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => {
                    // Show a confirmation dialog to confirm the deletion
                    const confirmed = confirm('Are you sure you want to delete this exercise?');

                    if (confirmed) {
                        // Perform the delete request to the server
                        fetch('/exercise/delete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ id: rowData.id }) // Assuming there's an "id" property in the row data
                        })
                        .then(response => {
                            if (response.ok) {
                                // Remove the row from the table upon successful deletion
                                row.remove();
                            } else {
                                // Handle the error case
                                console.error('Error deleting exercise');
                            }
                        })
                        .catch(error => {
                            // Handle any network or fetch error
                            console.error('Error deleting exercise: ', error);
                        });
                    }
                });

                tableBody.appendChild(row);
            });
        });
});