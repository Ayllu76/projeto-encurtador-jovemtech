document.getElementById('urlForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede a página de recarregar
    
    const longUrlInput = document.getElementById('longUrl');
    const longUrl = longUrlInput.value;

    // 1. Simulação de geração de hash aleatório (Simulando o Back-end)
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const shortUrl = `https://pvt.li{uniqueId}`;

    // 2. Exibir bloco de resultado
    const resultBox = document.getElementById('resultBox');
    const shortUrlText = document.getElementById('shortUrlText');
    
    shortUrlText.innerText = shortUrl;
    resultBox.classList.remove('hidden');

    // 3. Salvar no Histórico Local
    salvarNoHistorico(longUrl, shortUrl);

    // Limpar o campo de entrada
    longUrlInput.value = '';
});

// Ação de Copiar com feedback visual
document.getElementById('btnCopy').addEventListener('click', function() {
    const textToCopy = document.getElementById('shortUrlText').innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('toastFeedback');
        
        // Exibe o balão "Copiado!" temporariamente
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    });
});

// Função para persistir dados no LocalStorage
function salvarNoHistorico(long, short) {
    let historico = JSON.parse(localStorage.getItem('linksEncurtados')) || [];
    
    // Adiciona o novo link no topo da lista
    historico.unshift({ long, short });
    
    // Limita o histórico para exibir apenas os 4 últimos
    if(historico.length > 4) historico.pop();
    
    localStorage.setItem('linksEncurtados', JSON.stringify(historico));
    renderizarHistorico();
}

// Função para construir os elementos do histórico na tela
function renderizarHistorico() {
    const historyList = document.getElementById('historyList');
    const historico = JSON.parse(localStorage.getItem('linksEncurtados')) || [];
    
    historyList.innerHTML = ''; // Limpa a lista atual

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

// Carregar o histórico assim que a página abrir
window.onload = renderizarHistorico;
