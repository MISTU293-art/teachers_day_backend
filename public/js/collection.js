document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('studentSearchInput');
  const searchResults = document.getElementById('searchResults');
  const studentInfoCard = document.getElementById('studentInfoCard');
  const collectionForm = document.getElementById('collectionForm');
  const amountInput = document.getElementById('amountInput');
  const selectedStudentId = document.getElementById('selectedStudentId');
  const alertContainer = document.getElementById('collectionAlertContainer');

  let searchTimeout = null;

  // Search autocomplete
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length < 1) {
        searchResults.classList.add('d-none');
        searchResults.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`/students/api/search?q=${encodeURIComponent(query)}`);
          const json = await res.json();

          if (json.success && json.data.length > 0) {
            searchResults.innerHTML = '';
            json.data.forEach(student => {
              const item = document.createElement('a');
              item.href = '#';
              item.className = 'list-group-item list-group-item-action bg-dark text-light border-secondary d-flex justify-content-between align-items-center py-2';
              
              const isFirstYear = student.year === '1st Year' || student.year === '1st';
              const yearBadgeClass = isFirstYear ? 'badge bg-danger' : 'badge bg-primary';

              item.innerHTML = `
                <div>
                  <strong>${escapeHtml(student.name)}</strong>
                  <span class="text-secondary ms-2 small">(${escapeHtml(student.rollNumber)})</span>
                </div>
                <div>
                  <span class="${yearBadgeClass} me-2">${escapeHtml(student.year)}</span>
                  <span class="badge bg-secondary">${escapeHtml(student.department || 'CSE')}</span>
                </div>
              `;

              item.addEventListener('click', (ev) => {
                ev.preventDefault();
                selectStudent(student);
              });

              searchResults.appendChild(item);
            });
            searchResults.classList.remove('d-none');
          } else {
            searchResults.innerHTML = '<div class="list-group-item bg-dark text-secondary border-secondary small py-2">No students found matching your search.</div>';
            searchResults.classList.remove('d-none');
          }
        } catch (err) {
          console.error('Search error:', err);
        }
      }, 250);
    });

    // Close search results on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('d-none');
      }
    });
  }

  // Preset amount buttons
  const presetButtons = document.querySelectorAll('.btn-preset-amount');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
      presetButtons.forEach(b => b.classList.add('btn-outline-secondary'));
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary', 'active');
      if (amountInput) amountInput.value = btn.dataset.amount;
    });
  });

  // Select student handler
  function selectStudent(student) {
    searchResults.classList.add('d-none');
    searchInput.value = `${student.name} (${student.rollNumber})`;
    selectedStudentId.value = student._id;

    const isFirstYear = student.year === '1st Year' || student.year === '1st';

    // Populate student info card
    document.getElementById('infoStudentName').textContent = student.name;
    document.getElementById('infoRollNumber').textContent = student.rollNumber;
    document.getElementById('infoRegNumber').textContent = student.registrationNumber || 'N/A';
    document.getElementById('infoDepartment').textContent = student.department || 'CSE';
    document.getElementById('infoYear').textContent = student.year;
    document.getElementById('infoPreviousContribution').textContent = `₹${student.totalContributed || 0}`;

    const yearBadge = document.getElementById('infoYearBadge');
    if (yearBadge) {
      yearBadge.className = isFirstYear ? 'badge bg-danger' : 'badge bg-info';
      yearBadge.textContent = student.year;
    }

    studentInfoCard.classList.remove('d-none');

    // First Year Check
    if (isFirstYear) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i class="fa-solid fa-triangle-exclamation fa-2x me-3"></i>
          <div>
            <h5 class="alert-heading mb-1">⚠️ Contribution Not Allowed</h5>
            <p class="mb-0">First-year students are not eligible for the Teachers' Day contribution. The backend will strictly reject any submission for 1st-year students.</p>
          </div>
        </div>
      `;
      collectionForm.classList.add('d-none');
    } else {
      if (student.totalContributed > 0) {
        alertContainer.innerHTML = `
          <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i class="fa-solid fa-circle-info fa-2x me-3"></i>
            <div>
              <h6 class="alert-heading mb-1">Previous Contribution Detected</h6>
              <p class="mb-0">This student has already contributed <strong>₹${student.totalContributed}</strong>. You may record an additional contribution if intended.</p>
            </div>
          </div>
        `;
      } else {
        alertContainer.innerHTML = '';
      }
      collectionForm.classList.remove('d-none');
    }
  }

  // Handle AJAX contribution submission
  if (collectionForm) {
    collectionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const studentId = selectedStudentId.value;
      const amount = amountInput.value;
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash';
      const notes = document.getElementById('notesInput')?.value || '';
      const submitBtn = document.getElementById('submitCollectionBtn');

      if (!studentId) {
        showToast('Please select a student first.', 'danger');
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        showToast('Please enter a valid amount greater than ₹0.', 'danger');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Payment...';

      try {
        const response = await fetch('/contributions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            studentId,
            amount,
            paymentMethod,
            notes,
            allowMultiple: true
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Success! Show confirmation modal or redirect to receipt
          showSuccessModal(data.data);
        } else {
          alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="fa-solid fa-circle-xmark me-2"></i> ${escapeHtml(data.message || 'Payment could not be recorded.')}
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
          `;
        }
      } catch (error) {
        console.error('Submission error:', error);
        showToast('An unexpected network error occurred. Please try again.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-check-double me-2"></i>Record & Generate Receipt';
      }
    });
  }

  function showSuccessModal(data) {
    const receiptModalEl = document.getElementById('receiptSuccessModal');
    if (receiptModalEl) {
      document.getElementById('modalStudentName').textContent = data.studentName;
      document.getElementById('modalRollNumber').textContent = data.rollNumber;
      document.getElementById('modalAmount').textContent = `₹${data.amount}`;
      document.getElementById('modalTxId').textContent = data.transactionReference;
      document.getElementById('modalCollector').textContent = data.collectedByName;
      document.getElementById('modalReceiptLink').href = data.receiptUrl;
      document.getElementById('modalReceiptPdfLink').href = `${data.receiptUrl}/pdf`;

      const modal = new bootstrap.Modal(receiptModalEl);
      modal.show();

      // Reset form
      searchInput.value = '';
      selectedStudentId.value = '';
      amountInput.value = '';
      if (document.getElementById('notesInput')) document.getElementById('notesInput').value = '';
      studentInfoCard.classList.add('d-none');
      collectionForm.classList.add('d-none');
      alertContainer.innerHTML = '';
    } else {
      window.location.href = data.receiptUrl;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function showToast(msg, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-4 z-index-toast`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `${escapeHtml(msg)} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 4000);
  }
});
