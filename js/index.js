document.getElementById('urlForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const longUrlInput = document.getElementById('longUrl');
    let longUrl = longUrlInput.value.trim();

    // Se o usuário não colocar http:// ou https://, adicionamos o https:// automaticamente
    if (!/^https?:\/\//i.test(longUrl)) {
        longUrl = 'https://' + longUrl;
    }

    // Testa se a URL é válida de verdade usando a API do navegador
    try {
        new URL(longUrl);
    } catch (_) {
        alert('Por favor, insira um endereço de link válido.');
        return;
    }

    // Simulação de geração do link curto
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const shortUrl = `https://pvt.li{uniqueId}`;

    // Exibe o resultado na tela
    const resultBox = document.getElementById('resultBox');
    const shortUrlText = document.getElementById('shortUrlText');
    
    shortUrlText.innerText = shortUrl;
    resultBox.classList.remove('hidden');

    // Salva no histórico local
    salvarNoHistorico(longUrl, shortUrl);

    // Limpa o campo de entrada
    longUrlInput.value = '';
});

document.getElementById('btnCopy').addEventListener('click', function() {
    const textToCopy = document.getElementById('shortUrlText').innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('toastFeedback');
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    });
});

function salvarNoHistorico(long, short) {
    let historico = JSON.parse(localStorage.getItem('linksEncurtados')) || [];
    historico.unshift({ long, short });
    
    if (historico.length > 4) historico.pop();
    
    localStorage.setItem('linksEncurtados', JSON.stringify(historico));
    renderizarHistorico();
}

function renderizarHistorico() {
    const historyList = document.getElementById('historyList');
    const historico = JSON.parse(localStorage.getItem('linksEncurtados')) || [];
    
    historyList.innerHTML = '';

    if (historico.length === 0) {
        historyList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.875rem;">Nenhum link recente.</li>';
        return;
    }

    historico.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <a href="${item.long}" target="_blank" title="${item.long}">${item.long}</a>
            <span>${item.short}</span>
        `;
        historyList.appendChild(li);
    });
}

window.onload = renderizarHistorico;
