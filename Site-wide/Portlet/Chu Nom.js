(function () {

    function applyNom() {
        const span = document.querySelector(
            'a[data-language-autonym="中文（简体）"] span'
        );

        if (!span || span.dataset.nomApplied) return;

        span.textContent = '𡨸喃';

        // Ép fallback CJK
        span.lang = 'zh-Hant';

        // Class riêng
        span.classList.add('chunom');

        span.dataset.nomApplied = '1';
    }

    const checkbox = document.getElementById('p-lang-btn-checkbox');

    if (checkbox) {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                setTimeout(applyNom, 50);
            }
        });
    }

    applyNom();

})();
