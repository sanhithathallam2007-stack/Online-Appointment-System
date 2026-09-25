document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('providersList') || document.getElementById('categoriesList');
    if (list) {
        list.innerHTML = '<p>Providers and categories data will appear here.</p>';
    }
});
