document.addEventListener('DOMContentLoaded', () => {
    const operationsList = document.getElementById('operations-list');
    const repairProceduresList = document.getElementById('repair-procedures-list');
    const operationDetailsContent = document.getElementById('operation-details-content');
    const clearFilterBtn = document.getElementById('clear-filter-btn');
    const operationFilterToggle = document.getElementById('operation-filter-toggle');
    const toggleLabel = document.getElementById('toggle-label');
    const operationsSummary = document.getElementById('operations-summary');
    const tabButtons = document.querySelectorAll('.tabs .tab-button');
    const addOperationBtn = document.getElementById('add-operation-btn');

    // Elements for Operation Details (Central Panel)
    const currentOpTitleSpan = document.getElementById('current-op-title');
    const opDrivingConditions = document.getElementById('op-driving-conditions');
    const currentOpInstructionsP = document.getElementById('current-op-instructions');
    const currentOpTitleMaterials = document.querySelector('.current-op-title-materials');
    const currentOpTitleTools = document.querySelector('.current-op-title-tools');
    const currentOpTitleMachines = document.querySelector('.current-op-title-machines');
    const currentOpTitleFiles = document.querySelector('.current-op-title-files');
    const currentOpTitleDetails = document.querySelector('.current-op-title-details');
    const opPredecessors = document.getElementById('op-predecessors');
    const opSuccessors = document.getElementById('op-successors');
    const opOriginalSequence = document.getElementById('op-original-sequence');
    const opConstraintLevel = document.getElementById('op-constraint-level');

    let allOperationsData = []; // Store the original, unfiltered operations
    let selectedRepairProcedure = null; // Stores the ID of the currently selected repair procedure
    let currentSelectedOperationId = null; // Stores the ID of the currently selected operation for details panel
    let nextUserAddedOpId = 1; // Counter for user-added operations

    // --- Data Definitions (Mimicking your blueprint, enhanced with more details) ---
    // Removed 'required' property. Added 'drivingConditions' and 'constraints'.
    const initialOperationsData = [
        { id: 'op10', name: 'Operation 10 - Material Removal & Blending', sources: ['Repair 1037', 'Repair 3820', 'Repair 3854'], origin: 'OEM', drivingConditions: 'Visible surface corrosion (Area A), Crack indication (Area B)', constraints: 'strong', predecessors: [], successors: ['op20'], originalSequence: '1' , details: 'Detailed instructions for Material Removal and Blending. Ensure proper surface preparation. This operation is critical for preparing the surface for subsequent repairs. Follow all safety protocols.' },
        { id: 'op20', name: 'Operation 20 - Stress Relief & Post-Blend Inspection', sources: ['Repair 1037', 'Repair 3820'], origin: 'OEM', drivingConditions: 'Post-weld residual stress, Blending completed (Area B)', constraints: 'strong', predecessors: ['op10'], successors: ['op30'], originalSequence: '2' , details: 'Perform stress relief according to procedure. Follow with a thorough post-blend inspection for defects. Use specified equipment and monitor temperature cycles. Document all inspection findings carefully.' },
        { id: 'op30', name: 'Operation 30 - Surface Treatment', sources: ['Repair 1012', 'Repair 1043'], origin: 'OEM', drivingConditions: 'Surface porosity (Area C), High temperature exposure', constraints: 'loose', predecessors: ['op20'], successors: ['op40'], originalSequence: '3' , details: 'Apply specified surface treatment. Monitor temperature and curing times. This operation is conditional and may not be required for all repair paths.' },
        { id: 'op40', name: 'Operation 40 - Thermal Barrier Coating (TBC) Restoration', sources: ['Repair 3820'], origin: 'OEM', drivingConditions: 'TBC spallation (Area D), Erosion damage (Area E)', constraints: 'loose', predecessors: ['op30'], successors: ['op50'], originalSequence: '4' , details: 'Restore TBC layer. Ensure uniform thickness and adhesion. This requires specialized equipment and trained personnel. Verify coating integrity post-application.' },
        { id: 'op50', name: 'Operation 50 - Post-Repair Verification', sources: ['Repair 1037', 'Repair 1044'], origin: 'CBP', drivingConditions: 'All previous repairs completed, Final quality gate', constraints: 'strong', predecessors: ['op40'], successors: ['op60'], originalSequence: '5' , details: 'Conduct final verification checks. Document all findings. This includes visual inspection, dimensional checks, and any other required NDT.' },
        { id: 'op60', name: 'Operation 60 - Dimensional Inspection', sources: ['Repair 1012', 'Repair 1036'], origin: 'CBP', drivingConditions: 'Suspected dimensional distortion (Area F), Critical fit-up requirements', constraints: 'loose', predecessors: ['op50'], successors: ['op70'], originalSequence: '6' , details: 'Perform precise dimensional inspection. Compare with engineering drawings. This operation is often skipped if previous inspections confirm dimensions are within tolerance.' },
        { id: 'op70', name: 'Operation 70 - Weld Repair', sources: ['Repair 1045'], origin: 'CBP', drivingConditions: 'Crack indication (Area B), Material loss (Area G)', constraints: 'strong', predecessors: ['op60'], successors: ['op80'], originalSequence: '7' , details: 'Execute weld repair as per specification. Use approved welding techniques. Critical for structural integrity. Ensure proper pre-heat and post-weld treatment.' },
        { id: 'op80', name: 'Operation 80 - Heat Treatment', sources: ['Repair 1043', 'Repair 3854'], origin: 'OEM', drivingConditions: 'Post-weld material property restoration, Stress relief requirement', constraints: 'strong', predecessors: ['op70'], successors: ['op90'], originalSequence: '8' , details: 'Apply required heat treatment cycles. Control atmosphere and temperature. This process alters the material properties and is crucial for component performance.' },
        { id: 'op90', name: 'Operation 90 - Non-Destructive Testing (NDT)', sources: ['Repair 1012', 'Repair 3820'], origin: 'OEM', drivingConditions: 'Internal flaw detection, Post-weld inspection', constraints: 'strong', predecessors: ['op80'], successors: ['op100'], originalSequence: '9' , details: 'Perform NDT (e.g., FPI, X-ray) to detect internal flaws. This is a mandatory quality gate to ensure no hidden defects remain.' },
        { id: 'op100', name: 'Operation 100 - Coating Application', sources: ['Repair 1044'], origin: 'CBP', drivingConditions: 'Original coating damaged (Area D), Corrosion protection required', constraints: 'loose', predecessors: ['op90'], successors: ['op110'], originalSequence: '10' , details: 'Apply protective coating. Ensure even coverage and thickness. This operation is only needed if the original coating was damaged or removed.' },
        { id: 'op110', name: 'Operation 110 - Final Assembly Prep', sources: ['Repair 1037', 'Repair 1045'], origin: 'CBP', drivingConditions: 'Component reassembly, Cleanliness requirement', constraints: 'loose', predecessors: ['op100'], successors: ['op120'], originalSequence: '11' , details: 'Prepare component for final assembly. Clean and inspect mating surfaces. Ensure all foreign objects are removed.' },
        { id: 'op120', name: 'Operation 120 - Polishing & Finishing', sources: ['Repair 3854'], origin: 'OEM', drivingConditions: 'Surface roughness specification, Aesthetic requirement', constraints: 'loose', predecessors: ['op110'], successors: ['op130'], originalSequence: '12' , details: 'Polish and finish the repaired area to required surface roughness. This is often a cosmetic but also functional step.' },
        { id: 'op130', name: 'Operation 130 - Electrical Testing', sources: ['Repair 1012'], origin: 'OEM', drivingConditions: 'Electrical component functionality, Continuity check', constraints: 'loose', predecessors: ['op120'], successors: ['op140'], originalSequence: '13' , details: 'Conduct electrical tests to verify functionality. Applicable only to components with electrical interfaces.' },
        { id: 'op140', name: 'Operation 140 - Pressure Testing', sources: ['Repair 1043'], origin: 'OEM', drivingConditions: 'Internal pressure containment, Leakage prevention', constraints: 'loose', predecessors: ['op130'], successors: ['op150'], originalSequence: '14' , details: 'Perform pressure testing to ensure integrity. Only for components designed to hold pressure.' },
        { id: 'op150', name: 'Operation 150 - Leak Detection', sources: ['Repair 1044'], origin: 'CBP', drivingConditions: 'Post-pressure test verification, Fluid containment', constraints: 'loose', predecessors: ['op140'], successors: ['op160'], originalSequence: '15' , details: 'Check for any leaks using specified methods. Follows pressure testing if applicable.' },
        { id: 'op160', name: 'Operation 160 - Balance Check', sources: ['Repair 3820'], origin: 'OEM', drivingConditions: 'Rotating component, Vibration reduction', constraints: 'strong', predecessors: ['op150'], successors: ['op170'], originalSequence: '16' , details: 'Perform balance checks for rotating components. Essential for preventing vibration in service.' },
        { id: 'op170', name: 'Operation 170 - Post-Repair Verification Method II', sources: ['Repair 3820', 'Repair 1036'], origin: 'CBP', drivingConditions: 'Specific repair type (Area H), Alternative verification protocol', constraints: 'strong', predecessors: ['op160'], successors: ['op180'], originalSequence: '17' , details: 'Alternative post-repair verification method. Follow specific guidelines. Used for specific repair types or component geometries.' },
        { id: 'op180', name: 'Operation 180 - Documentation & Sign-off', sources: ['Repair 1037', 'Repair 1012'], origin: 'OEM', drivingConditions: 'Regulatory compliance, Traceability requirement', constraints: 'strong', predecessors: ['op170'], successors: ['op190'], originalSequence: '18' , details: 'Complete all repair documentation and obtain necessary sign-offs. Crucial for traceability and compliance.' },
        { id: 'op190', name: 'Operation 190 - Packaging for Shipment', sources: ['Repair 1045'], origin: 'CBP', drivingConditions: 'Component ready for dispatch, Protection during transport', constraints: 'strong', predecessors: ['op180'], successors: [], originalSequence: '19' , details: 'Prepare the component for safe shipment. Ensure proper packaging materials and labeling are used.' }
    ];

    const repairProceduresData = [
        { id: 'Repair 1012', tag: 'OEM' },
        { id: 'Repair 1036', tag: 'CBP' },
        { id: 'Repair 1037', tag: 'OEM' },
        { id: 'Repair 1043', tag: 'OEM' },
        { id: 'Repair 1044', tag: 'CBP' },
        { id: 'Repair 1045', tag: 'CBP' },
        { id: 'Repair 3820', tag: 'OEM' },
        { id: 'Repair 3854', tag: 'OEM' }
    ];

    // Initialize allOperationsData with a deep copy
    allOperationsData = JSON.parse(JSON.stringify(initialOperationsData));

    // --- SortableJS Initialization ---
    let sortable = null; // Declare sortable instance globally

    function initializeSortable() {
        if (sortable) {
            sortable.destroy(); // Destroy previous instance if it exists
        }
        sortable = Sortable.create(operationsList, {
            animation: 150,
            ghostClass: 'sortable-ghost', // Class name for the drop placeholder
            chosenClass: 'sortable-chosen', // Class name for the chosen item
            dragClass: 'sortable-drag', // Class name for the dragging item
            filter: '.dimmed', // Do not allow dragging of dimmed items
            onUpdate: function (evt) {
                // Update the underlying data array to reflect the new order
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                // Get the DOM elements in their new order
                const newOrderElements = Array.from(operationsList.children);
                // Map them back to their data objects
                const newOrderData = newOrderElements.map(el => {
                    const opId = el.dataset.operationId;
                    return allOperationsData.find(op => op.id === opId);
                });
                allOperationsData = newOrderData; // Update the master data array

                // Re-render to ensure consistency, keeping current selection
                renderOperations(getFilteredOperations(), currentSelectedOperationId);
            }
        });
    }

    // --- Initialization Functions ---

    function renderOperations(operationsToRender, selectedOpId = null) {
        operationsList.innerHTML = '';
        let visibleOperationsCount = 0;

        // Ensure the currently selected operation is still valid after filtering/re-rendering
        let currentSelectedOpExists = false;
        if (selectedOpId) {
            currentSelectedOpExists = operationsToRender.some(op => op.id === selectedOpId);
        }
        if (!currentSelectedOpExists && operationsToRender.length > 0) {
            // If the previously selected op is no longer in the list, select the first available
            selectedOpId = operationsToRender[0].id;
        } else if (!currentSelectedOpExists && operationsToRender.length === 0) {
            // If no operations are left, clear details
            selectedOpId = null;
            clearOperationDetails();
        }

        operationsToRender.forEach(op => {
            const opDiv = document.createElement('div');
            opDiv.classList.add('operation-item');
            opDiv.dataset.operationId = op.id;

            // Apply 'user-added' class
            if (op.origin === 'User Added') {
                opDiv.classList.add('user-added');
            }
            // Apply 'strong-constraint' class
            if (op.constraints === 'strong') {
                opDiv.classList.add('strong-constraint');
            }

            // Dimming logic for operations not matching the selected RP, but only if toggle is 'Show All'
            const isDimmedByFilter = selectedRepairProcedure && !op.sources.includes(selectedRepairProcedure) && !operationFilterToggle.checked;
            if (isDimmedByFilter) {
                opDiv.classList.add('dimmed');
            } else {
                visibleOperationsCount++;
            }

            if (selectedOpId === op.id && !isDimmedByFilter) {
                opDiv.classList.add('selected');
                updateOperationDetails(op);
                currentSelectedOperationId = op.id;
            }

            opDiv.innerHTML = `
                <h4>${op.name}</h4>
                <div class="operation-origin">${op.origin}</div>
                <div class="source-chips">
                    ${op.sources.map(source => `
                        <span class="op-source-chip ${selectedRepairProcedure === source ? 'highlighted' : ''}">
                            ${source}
                        </span>
                    `).join('')}
                </div>
            `;
            operationsList.appendChild(opDiv);
        });

        // Update summary text
        const totalOperations = allOperationsData.length; // Use the full list for total count
        if (selectedRepairProcedure && operationFilterToggle.checked) {
            operationsSummary.textContent = `Showing ${operationsToRender.length} of ${totalOperations} operations (Filtered by ${selectedRepairProcedure})`;
        } else if (selectedRepairProcedure && !operationFilterToggle.checked) {
            operationsSummary.textContent = `Showing ${visibleOperationsCount} of ${totalOperations} operations (Filtered by ${selectedRepairProcedure}, non-matching dimmed)`;
        } else {
            operationsSummary.textContent = `Total Plan includes ${totalOperations} operations`;
        }

        initializeSortable(); // Re-initialize SortableJS after rendering
    }

    function renderRepairProcedures() {
        repairProceduresList.innerHTML = '';
        document.getElementById('available-procedures-count').textContent = `${repairProceduresData.length} available`;

        repairProceduresData.forEach(rp => {
            const rpDiv = document.createElement('div');
            rpDiv.classList.add('repair-procedure-chip');
            rpDiv.dataset.repairProcedureId = rp.id;
            if (selectedRepairProcedure === rp.id) {
                rpDiv.classList.add('selected');
            }
            rpDiv.innerHTML = `
                <span class="rp-name">${rp.id}</span>
                <span class="rp-tag">${rp.tag}</span>
            `;
            repairProceduresList.appendChild(rpDiv);
        });
    }

    function updateOperationDetails(operation) {
        // Update the common titles for all tabs
        const opName = operation.name;
        currentOpTitleSpan.textContent = opName;
        opDrivingConditions.textContent = operation.drivingConditions || 'No specific conditions reported.';
        currentOpInstructionsP.textContent = operation.details;
        currentOpTitleMaterials.textContent = opName;
        currentOpTitleTools.textContent = opName;
        currentOpTitleMachines.textContent = opName;
        currentOpTitleFiles.textContent = opName;
        currentOpTitleDetails.textContent = opName;

        // Update specific details tab content
        opPredecessors.textContent = operation.predecessors.length > 0 ? operation.predecessors.join(', ') : 'None';
        opSuccessors.textContent = operation.successors.length > 0 ? operation.successors.join(', ') : 'None';
        opOriginalSequence.textContent = operation.originalSequence;
        opConstraintLevel.textContent = operation.constraints ? operation.constraints.charAt(0).toUpperCase() + operation.constraints.slice(1) : 'None Specified';
    }

    function clearOperationDetails() {
        currentOpTitleSpan.textContent = 'None Selected';
        opDrivingConditions.textContent = 'No conditions specified.';
        currentOpInstructionsP.textContent = 'Select an operation from the left to view its detailed work instructions and other information here.';
        currentOpTitleMaterials.textContent = '';
        currentOpTitleTools.textContent = '';
        currentOpTitleMachines.textContent = '';
        currentOpTitleFiles.textContent = '';
        currentOpTitleDetails.textContent = '';
        opPredecessors.textContent = '';
        opSuccessors.textContent = '';
        opOriginalSequence.textContent = '';
        opConstraintLevel.textContent = '';
    }

    // --- Event Handlers ---

    // Handle clicking on an operation in the left panel
    operationsList.addEventListener('click', (event) => {
        const opItem = event.target.closest('.operation-item');
        if (!opItem || opItem.classList.contains('dimmed')) return; // Ignore dimmed items

        // Remove 'selected' from previously selected operation
        document.querySelectorAll('.operation-item.selected').forEach(item => item.classList.remove('selected'));
        opItem.classList.add('selected');

        const operationId = opItem.dataset.operationId;
        currentSelectedOperationId = operationId;
        const selectedOp = allOperationsData.find(op => op.id === operationId);
        if (selectedOp) {
            updateOperationDetails(selectedOp);

            // Clear previous source highlights in right panel (except for the actively selected filter)
            document.querySelectorAll('.repair-procedure-chip').forEach(chip => {
                if (chip.dataset.repairProcedureId !== selectedRepairProcedure) {
                    chip.classList.remove('highlighted-source');
                }
            });

            // Highlight source Repair Procedures in the Right Panel
            selectedOp.sources.forEach(sourceId => {
                const rpChip = document.querySelector(`.repair-procedure-chip[data-repair-procedure-id="${sourceId}"]`);
                if (rpChip && selectedRepairProcedure !== sourceId) { // Don't override 'selected' state
                    rpChip.classList.add('highlighted-source');
                }
            });
            // Ensure the primary selected filter (if any) remains 'selected'
            if (selectedRepairProcedure) {
                document.querySelector(`.repair-procedure-chip[data-repair-procedure-id="${selectedRepairProcedure}"]`).classList.add('selected');
            }
        }
    });

    // Handle clicking on a Repair Procedure chip in the right panel
    repairProceduresList.addEventListener('click', (event) => {
        const rpChip = event.target.closest('.repair-procedure-chip');
        if (!rpChip) return;

        const rpId = rpChip.dataset.repairProcedureId;

        // Toggle selection
        if (selectedRepairProcedure === rpId) {
            // Deselect if already selected
            selectedRepairProcedure = null;
            rpChip.classList.remove('selected');
            clearFilterBtn.disabled = true;
            operationFilterToggle.checked = false; // Uncheck toggle
            toggleLabel.textContent = 'Show All Operations';
        } else {
            // Select new procedure
            document.querySelectorAll('.repair-procedure-chip.selected').forEach(chip => chip.classList.remove('selected'));
            rpChip.classList.add('selected');
            selectedRepairProcedure = rpId;
            clearFilterBtn.disabled = false;
            operationFilterToggle.checked = true; // Check toggle
            toggleLabel.textContent = `Show Filtered Operations (${rpId})`;
        }

        applyFilterAndRender();
    });

    // Handle Clear Filter button click
    clearFilterBtn.addEventListener('click', () => {
        selectedRepairProcedure = null;
        document.querySelectorAll('.repair-procedure-chip.selected').forEach(chip => chip.classList.remove('selected'));
        document.querySelectorAll('.repair-procedure-chip.highlighted-source').forEach(chip => chip.classList.remove('highlighted-source')); // Clear source highlights too
        clearFilterBtn.disabled = true;
        operationFilterToggle.checked = false; // Uncheck toggle
        toggleLabel.textContent = 'Show All Operations';
        applyFilterAndRender();
    });

    // Handle "Show All / Show Filtered" toggle
    operationFilterToggle.addEventListener('change', () => {
        applyFilterAndRender();
    });

    // Handle tab clicks in the central panel
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and show corresponding content
            button.classList.add('active');
            const targetTabId = button.dataset.tab + '-tab';
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // Handle Add New Operation button click
    addOperationBtn.addEventListener('click', () => {
        const newOpId = `userOp${nextUserAddedOpId++}`;
        const newOperation = {
            id: newOpId,
            name: `User Added Operation ${nextUserAddedOpId - 1}`,
            sources: ['User Added'],
            origin: 'User Added',
            drivingConditions: 'Inspector added due to specific observation/expert judgment.',
            constraints: 'loose', // User added operations typically have loose constraints by default
            predecessors: [], // Can be edited in a real system
            successors: [],   // Can be edited in a real system
            originalSequence: 'N/A',
            details: `This operation was added by the Inspector to address a specific condition or requirement. Justification: [Provide justification here]`
        };
        allOperationsData.push(newOperation); // Add to the master list
        applyFilterAndRender(); // Re-render to show the new operation
        // Optionally, select the newly added operation
        const newlyAddedOpElement = document.querySelector(`[data-operation-id="${newOpId}"]`);
        if (newlyAddedOpElement) {
            newlyAddedOpElement.click(); // Simulate click to select it
        }
    });

    function getFilteredOperations() {
        let operationsToProcess = JSON.parse(JSON.stringify(allOperationsData)); // Start with a fresh copy of current master data

        if (selectedRepairProcedure) {
            // Filter operations based on the selected repair procedure
            // Include User Added operations always, regardless of filter
            operationsToProcess = operationsToProcess.filter(op => op.sources.includes(selectedRepairProcedure) || op.origin === 'User Added');

            // If toggle is checked, we only show operations that match the selected RP OR are user-added.
            // If toggle is unchecked, operationsToProcess will contain all operations related to the selected RP
            // plus user-added ones. The render function will then dim the non-matching ones.
        }
        // If no repair procedure is selected, operationsToProcess remains a copy of allOperationsData
        return operationsToProcess;
    }

    function applyFilterAndRender() {
        const operationsToRender = getFilteredOperations();
        renderOperations(operationsToRender, currentSelectedOperationId);
        renderRepairProcedures(); // Re-render to update highlights
    }

    // --- Initial Load ---
    renderOperations(getFilteredOperations(), 'op20'); // Render initial operations, select op20
    renderRepairProcedures(); // Render all repair procedures
});