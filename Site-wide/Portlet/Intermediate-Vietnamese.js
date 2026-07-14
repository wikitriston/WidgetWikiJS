/* Bất kỳ mã JavaScript ở đây sẽ được tải cho tất cả các thành viên khi tải một trang nào đó lên. */
(function () {

    function applyNangcao() {
        const el = document.querySelector(
            'a[data-language-autonym="Tiếng Việt"] span'
        );

        if (!el || el.dataset.done) return;

        el.textContent = 'Nâng cao';
    }

    const checkbox = document.getElementById('p-lang-btn-checkbox');

    if (checkbox) {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                setTimeout(applyNangcao, 50);
            }
        });
    }

    applyNangcao();

})();
