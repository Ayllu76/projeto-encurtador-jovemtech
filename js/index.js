// INDICAÇÃO: Cole aqui a URL gerada pelo Cloudflare Workers (ex: https://workers.dev)
const URL_BASE_API = 'https://projeto-encurtador-de-links.pages.dev/'; 

document.getElementById('urlForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const longUrlInput = document.getElementById('longUrl');
    let longUrl = longUrlInput.value.trim();
    const btnShorten = document.getElementById('btnShorten');

    // 1. Garante que a URL comece com http:// ou https:// exigido pelo seu back-end
    if (!/^https?:\/\//i.test(longUrl)) {
        longUrl = 'https://' + longUrl;
    }

    // Validação nativa do navegador
    try {
        new URL(longUrl);
    } catch (_) {
        alert('Por favor, insira um endereço de link válido.');
        return;
    }

    // Feedback visual de carregamento
    btnShorten.innerText = 'Encurtando...';
    btnShorten.disabled = true;

    try {
        // 2. Faz a chamada POST exatamente como a ROTA 1 do seu back-end exige
        const response = await fetch(`${URL_BASE_API}/encurtar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                urlLonga: longUrl // Seu back-end espera exatamente a chave 'urlLonga'
            })
        });

        const data = await response.json();

        // Tratamento caso o seu Worker devolva alguma mensagem de erro tratada
        if (!response.ok || data.erro) {
            throw new Error(data.erro || 'Erro no servidor');
        }

        // 3. Captura o link gerado pelo seu Worker (propriedade 'linkCurto')
        const shortUrl = data.linkCurto;

        // 4. Renderiza o resultado real em tela
        const resultBox = document.getElementById('resultBox');
        const shortUrlText = document.getElementById('shortUrlText');
        
        shortUrlText.innerText = shortUrl;
        resultBox.classList.remove('hidden');

        // 5. Salva no histórico do navegador
        salvarNoHistorico(longUrl, shortUrl);

    } catch (error) {
        console.error(error);
        alert(error.message || 'Ocorreu um erro ao conectar com o seu Worker.');
    } finally {
        // Restaura os campos do formulário
        btnShorten.innerText = 'Encurtar';
        btnShorten.disabled = false;
        longUrlInput.value = '';
    }
});

// Lógica para o botão de copiar texto
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

// Funções para gerenciar o histórico via LocalStorage
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
            <a href="${item.long}" target="_blank" class="long-link" title="${item.long}">${item.long}</a>
            <a href="${item.short}" target="_blank" class="short-link">${item.short}</a>
        `;
        historyList.appendChild(li);
    });
}

window.onload = renderizarHistorico;

