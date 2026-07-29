function showAgreementModal() {
    var m = document.getElementById('agreement-modal');
    if (m) m.classList.add('show');
}

function closeAgreementModal() {
    var m = document.getElementById('agreement-modal');
    if (m) m.classList.remove('show');
}

function confirmAgreement() {
    closeAgreementModal();
    go(1);
}
