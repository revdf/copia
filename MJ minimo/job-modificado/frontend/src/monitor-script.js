// 🔍 Script de Monitoramento Frontend
// Este script pode ser injetado em qualquer página para monitorar atividades

(function() {
    'use strict';
    
    // Configurações
    const MONITOR_CONFIG = {
        enabled: true,
        logToConsole: true,
        logToServer: false,
        serverUrl: 'http://localhost:5000/api/monitor',
        captureClicks: true,
        captureForms: true,
        captureErrors: true,
        captureNavigation: true,
        captureFileUploads: true,
        maxLogs: 1000
    };
    
    // Armazenamento de logs
    let logs = [];
    let eventCount = 0;
    
    // Função para adicionar log
    function addLog(message, type = 'info', data = null) {
        const logEntry = {
            id: ++eventCount,
            timestamp: new Date().toISOString(),
            message,
            type,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        logs.push(logEntry);
        
        // Limitar número de logs
        if (logs.length > MONITOR_CONFIG.maxLogs) {
            logs.shift();
        }
        
        // Log no console se habilitado
        if (MONITOR_CONFIG.logToConsole) {
            const prefix = `[MONITOR ${type.toUpperCase()}]`;
            console.log(prefix, message, data || '');
        }
        
        // Enviar para servidor se habilitado
        if (MONITOR_CONFIG.logToServer) {
            sendLogToServer(logEntry);
        }
    }
    
    // Função para enviar log para servidor
    async function sendLogToServer(logEntry) {
        try {
            await fetch(MONITOR_CONFIG.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('[MONITOR] Erro ao enviar log para servidor:', error);
        }
    }
    
    // Handlers de eventos
    function handleClick(event) {
        if (!MONITOR_CONFIG.captureClicks) return;
        
        const target = event.target;
        const clickData = {
            tagName: target.tagName,
            id: target.id || null,
            className: target.className || null,
            textContent: target.textContent?.substring(0, 50) || null,
            x: event.clientX,
            y: event.clientY
        };
        
        addLog(`Clique em ${target.tagName}${target.id ? ` (ID: ${target.id})` : ''}`, 'click', clickData);
    }
    
    function handleFormSubmit(event) {
        if (!MONITOR_CONFIG.captureForms) return;
        
        const form = event.target;
        const formData = new FormData(form);
        const formFields = {};
        
        for (let [key, value] of formData.entries()) {
            // Não capturar senhas por segurança
            if (key.toLowerCase().includes('password')) {
                formFields[key] = '[PROTEGIDO]';
            } else {
                formFields[key] = value;
            }
        }
        
        addLog(`Formulário enviado: ${form.id || 'sem ID'}`, 'form', {
            formId: form.id,
            formAction: form.action,
            formMethod: form.method,
            fields: formFields
        });
    }
    
    function handleFileUpload(event) {
        if (!MONITOR_CONFIG.captureFileUploads) return;
        
        const target = event.target;
        if (target.type === 'file') {
            const files = target.files;
            if (files.length > 0) {
                const fileInfo = Array.from(files).map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                }));
                
                addLog(`Upload de arquivo: ${files.length} arquivo(s)`, 'upload', {
                    inputId: target.id,
                    inputName: target.name,
                    files: fileInfo
                });
            }
        }
    }
    
    function handleError(event) {
        if (!MONITOR_CONFIG.captureErrors) return;
        
        addLog(`Erro JavaScript: ${event.message}`, 'error', {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.toString() || null
        });
    }
    
    function handleNavigation() {
        if (!MONITOR_CONFIG.captureNavigation) return;
        
        addLog('Navegação detectada', 'navigation', {
            from: document.referrer,
            to: window.location.href
        });
    }
    
    function handlePageLoad() {
        addLog('Página carregada', 'page', {
            title: document.title,
            url: window.location.href,
            referrer: document.referrer
        });
    }
    
    function handlePageUnload() {
        addLog('Página sendo fechada', 'page', {
            url: window.location.href
        });
    }
    
    // Função para obter logs
    function getLogs() {
        return logs;
    }
    
    // Função para limpar logs
    function clearLogs() {
        logs = [];
        eventCount = 0;
        addLog('Logs limpos', 'system');
    }
    
    // Função para exportar logs
    function exportLogs() {
        const logData = {
            timestamp: new Date().toISOString(),
            page: window.location.href,
            totalEvents: eventCount,
            logs: logs
        };
        
        const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitor-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        addLog('Logs exportados', 'system');
    }
    
    // Função para testar conexão com servidor
    async function testServerConnection() {
        addLog('Testando conexão com servidor...', 'system');
        
        try {
            const response = await fetch('http://localhost:5000/api/test');
            const result = await response.json();
            
            if (response.ok) {
                addLog('Conexão com servidor OK', 'success', result);
            } else {
                addLog('Erro na resposta do servidor', 'error', result);
            }
        } catch (error) {
            addLog(`Erro de conexão: ${error.message}`, 'error');
        }
    }
    
    // Inicializar monitoramento
    function initMonitoring() {
        if (!MONITOR_CONFIG.enabled) return;
        
        addLog('Monitoramento iniciado', 'system');
        
        // Adicionar event listeners
        if (MONITOR_CONFIG.captureClicks) {
            document.addEventListener('click', handleClick);
        }
        
        if (MONITOR_CONFIG.captureForms) {
            document.addEventListener('submit', handleFormSubmit);
        }
        
        if (MONITOR_CONFIG.captureFileUploads) {
            document.addEventListener('change', handleFileUpload);
        }
        
        if (MONITOR_CONFIG.captureErrors) {
            window.addEventListener('error', handleError);
        }
        
        if (MONITOR_CONFIG.captureNavigation) {
            window.addEventListener('popstate', handleNavigation);
            window.addEventListener('beforeunload', handlePageUnload);
        }
        
        // Log do carregamento da página
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handlePageLoad);
        } else {
            handlePageLoad();
        }
    }
    
    // Expor funções globalmente
    window.Monitor = {
        addLog,
        getLogs,
        clearLogs,
        exportLogs,
        testServerConnection,
        initMonitoring,
        config: MONITOR_CONFIG
    };
    
    // Inicializar automaticamente
    initMonitoring();
    
    // Log inicial
    addLog('Script de monitoramento carregado', 'system');
    
})(); 