
document.addEventListener('DOMContentLoaded', function() {
    
    updateBillHeader();
    
   
    initQuantityCounter();
    
   
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    document.getElementById('generateBillBtn').addEventListener('click', function() {
        showConfirmModal('Gerar Fatura', 'Deseja gerar a fatura com os dados atuais?', generateBill);
    });

    document.getElementById('customerPhone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.substring(0, 2)})${value.substring(2)}`;
            } else {
                value = `(${value.substring(0, 2)})${value.substring(2, 7)}-${value.substring(7, 11)}`;
            }
        }
        e.target.value = value;
    });

    document.getElementById('customerEmail').addEventListener('blur', function() {
        const email = this.value;
        if (email && (!email.includes('@') || !email.includes('.'))) {
            showAlert('Email inválido. Deve conter @ e ponto.', 'warning');
            this.classList.add('invalid-input');
        } else {
            this.classList.remove('invalid-input');
        }
    });

    document.getElementById('clearBtn').addEventListener('click', function() {
        showConfirmModal('Limpar Todos os Dados', 'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.', clearFields);
    });
    document.getElementById('exitBtn').addEventListener('click', function() {
        showConfirmModal('Sair do Sistema', 'Tem certeza que deseja sair? Todos os dados não salvos serão perdidos.', exitApp);
    });
    document.getElementById('applyDiscountTaxBtn').addEventListener('click', calculateWithDiscountTax);
    
    
    document.getElementById('customerName').addEventListener('input', updateBillHeader);
    document.getElementById('customerPhone').addEventListener('input', updateBillHeader);
    document.getElementById('customerEmail').addEventListener('input', updateBillHeader);
    
    
    document.querySelectorAll('.close-modal').forEach(function(el) {
        el.addEventListener('click', closeAllModals);
    });
    
    document.getElementById('modalCancel').addEventListener('click', closeAllModals);
    document.getElementById('successOk').addEventListener('click', closeAllModals);
    
    
    checkEmptyProductList();
});

function initQuantityCounter() {
    document.getElementById('decreaseQty').addEventListener('click', function() {
        const input = document.getElementById('productQuantity');
        const value = parseInt(input.value);
        if (value > 1) {
            input.value = value - 1;
        }
    });
    
    document.getElementById('increaseQty').addEventListener('click', function() {
        const input = document.getElementById('productQuantity');
        const value = parseInt(input.value);
        input.value = value + 1;
    });
}

function showConfirmModal(title, message, confirmCallback, cancelCallback) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirm = document.getElementById('modalConfirm');
    
    
    title = title || 'Confirmação';
    message = message || 'Tem certeza que deseja continuar?';
    
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    
    const newModalConfirm = modalConfirm.cloneNode(true);
    modalConfirm.parentNode.replaceChild(newModalConfirm, modalConfirm);
    
    
    newModalConfirm.addEventListener('click', function() {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        closeAllModals();
    });
    
    modal.classList.add('show');
}


function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const modalTitle = document.getElementById('successTitle');
    const modalMessage = document.getElementById('successMessage');
    
  
    title = title || 'Sucesso';
    message = message || 'Operação realizada com sucesso!';
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modal.classList.add('show');
}


function closeAllModals() {
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.classList.remove('show');
    });
}


function showAlert(message, type) {
    const alertArea = document.getElementById('alertArea');
    type = type || 'success';
    
   
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fa-solid fa-circle-check"></i>';
            break;
        case 'warning':
            icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
            break;
        case 'error':
            icon = '<i class="fa-solid fa-circle-xmark"></i>';
            break;
        default:
            icon = '<i class="fa-solid fa-circle-info"></i>';
    }
    

    let title = '';
    switch(type) {
        case 'success':
            title = 'Sucesso!';
            break;
        case 'warning':
            title = 'Atenção!';
            break;
        case 'error':
            title = 'Erro!';
            break;
        default:
            title = 'Informação';
    }
    
    
    alert.innerHTML = `
        ${icon}
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <span class="close-alert">
            <i class="fa-solid fa-xmark"></i>
        </span>
    `;
    
 
    alertArea.appendChild(alert);
    
   
    alert.querySelector('.close-alert').addEventListener('click', function() {
        alert.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(function() {
            if (alert.parentNode === alertArea) {
                alertArea.removeChild(alert);
            }
        }, 300);
    });
    

    setTimeout(function() {
        if (alert.parentNode === alertArea) {
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(function() {
                if (alert.parentNode === alertArea) {
                    alertArea.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
}


function updateBillHeader() {
    const billContent = document.getElementById('billContent');
    const customerName = document.getElementById('customerName').value || '';
    const customerPhone = document.getElementById('customerPhone').value || '';
    const customerEmail = document.getElementById('customerEmail').value || '';
    const invoiceNumber = document.getElementById('invoiceNumber').textContent;
    const currentDate = document.getElementById('currentDate').textContent;
    

    const dateObj = new Date();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const formattedDate = `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;
    
  
    let header = '';
    header += `FATURA Nº: ${invoiceNumber}\n`;
    header += `Data: ${formattedDate}\n`;
    header += `────────────────────────────────────\n`;
    
    if (customerName) {
        header += `Cliente: ${customerName}\n`;
    }
    
    if (customerPhone) {
        header += `Telefone: ${customerPhone}\n`;
    }
    
    if (customerEmail) {
        header += `Email: ${customerEmail}\n`;
    }
    
    if (customerName || customerPhone || customerEmail) {
        
        header += `────────────────────────────────────\n`;
    }
    
    header += 'Produto                  Qtd     Preço\n';

    header += `────────────────────────────────────\n`;
    
  
    billContent.innerHTML = header;
}


function addProductToList(item) {
    const productItems = document.getElementById('productItems');
    const emptyCart = document.getElementById('emptyCart');
    
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    
    productItem.innerHTML = `
        <span>${item.name}</span>
        <span>R$ ${item.price.toFixed(2)}</span>
        <span>${item.quantity}</span>
        <span class="total">R$ ${item.total.toFixed(2)}</span>
    `;
    
    productItems.appendChild(productItem);
    
   
    emptyCart.style.display = 'none';
    
 
    updateSummary();
}


function checkEmptyProductList() {
    const productItems = document.getElementById('productItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (productItems.children.length === 0) {
        emptyCart.style.display = 'flex';
    } else {
        emptyCart.style.display = 'none';
    }
}


function updateBillItems(item) {
    const billContent = document.getElementById('billContent');
    const currentContent = billContent.innerHTML;
    

    const itemText = `${item.name.padEnd(24)} ${item.quantity.toString().padStart(3)}   R$${item.price.toFixed(2).padStart(6)}\n`;
    

    const newContent = currentContent + itemText;
    billContent.innerHTML = newContent;
}


function updateSummary() {
    
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            discount: parseFloat(document.getElementById('discountPercent').value || 0),
            tax: parseFloat(document.getElementById('taxPercent').value || 0)
        }),
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.status === 'success') {
            const productItems = document.getElementById('productItems').children;
            document.getElementById('totalItems').textContent = productItems.length;
            
            let totalQty = 0;
            for (let i = 0; i < productItems.length; i++) {
                const qty = parseInt(productItems[i].children[2].textContent);
                totalQty += qty;
            }
            document.getElementById('totalQuantity').textContent = totalQty;
            
            document.getElementById('subtotalValue').textContent = `R$ ${data.subtotal.toFixed(2)}`;
            
            
            const total = data.subtotal - data.discount.amount + data.tax.amount;
            document.getElementById('totalValue').textContent = `R$ ${total.toFixed(2)}`;
        }
    })
    .catch(function(error) {
        console.error('Erro ao atualizar resumo:', error);
    });
}


function addItem() {
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);
    
    if (!productName) {
        showAlert('Por favor, insira o nome do produto', 'warning');
        document.getElementById('productName').focus();
        return;
    }
    
    if (isNaN(productPrice) || productPrice <= 0) {
        showAlert('Por favor, insira um preço válido', 'warning');
        document.getElementById('productPrice').focus();
        return;
    }
    
    if (isNaN(productQuantity) || productQuantity <= 0) {
        showAlert('Por favor, insira uma quantidade válida', 'warning');
        document.getElementById('productQuantity').focus();
        return;
    }
    
  
    fetch('/add_item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: productName,
            price: productPrice,
            quantity: productQuantity
        }),
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.status === 'success') {
            
            addProductToList(data.item);
            
           
            updateBillItems(data.item);
            
           
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productQuantity').value = '1';
            
            
            showAlert(data.message, 'success');
            
            
            document.getElementById('productName').focus();
        } else {
         
            showAlert(data.message, 'error');
        }
    })
    .catch(function(error) {
        console.error('Erro:', error);
        showAlert('Erro ao adicionar item. Verifique sua conexão.', 'error');
    });
}


function calculateWithDiscountTax() {
    const discountPercent = parseFloat(document.getElementById('discountPercent').value || 0);
    const taxPercent = parseFloat(document.getElementById('taxPercent').value || 0);
    
    
    if (discountPercent < 0 || discountPercent > 100) {
        showAlert('Percentual de desconto deve estar entre 0 e 100', 'warning');
        return;
    }
    
    if (taxPercent < 0 || taxPercent > 100) {
        showAlert('Percentual de imposto deve estar entre 0 e 100', 'warning');
        return;
    }
    
    
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            discount: discountPercent,
            tax: taxPercent
        }),
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.status === 'success') {
            
            const calculation = {
                subtotal: data.subtotal.toFixed(2),
                discount: {
                    percent: data.discount.percent,
                    amount: data.discount.amount.toFixed(2)
                },
                tax: {
                    percent: data.tax.percent,
                    amount: data.tax.amount.toFixed(2)
                },
                total: data.total.toFixed(2)
            };
            
            
            const subtotalFormatted = `R$ ${calculation.subtotal}`;
            const discountFormatted = `- R$ ${calculation.discount.amount}`;
            const taxFormatted = `+ R$ ${calculation.tax.amount}`;
            const totalFormatted = `R$ ${calculation.total}`;
            
           
            showConfirmModal(
                "Detalhes do Cálculo",
                `
                <div class="calculation-details">
                    <div class="calc-row">
                        <span>Subtotal:</span>
                        <span>${subtotalFormatted}</span>
                    </div>
                    ${data.discount.percent > 0 ? 
                        `<div class="calc-row">
                            <span>Desconto (${data.discount.percent}%):</span>
                            <span class="discount-value">${discountFormatted}</span>
                        </div>` : ''}
                    ${data.tax.percent > 0 ? 
                        `<div class="calc-row">
                            <span>Imposto (${data.tax.percent}%):</span>
                            <span class="tax-value">${taxFormatted}</span>
                        </div>` : ''}
                    <div class="calc-row total">
                        <span>TOTAL:</span>
                        <span>${totalFormatted}</span>
                    </div>
                </div>
                `,
                function() {
                    
                    updateSummary();
                    showAlert('Desconto e imposto aplicados com sucesso!', 'success');
                }
            );
            
            
            document.getElementById('modalBody').innerHTML = document.getElementById('modalBody').textContent;
        } else {
           
            showAlert(data.message, 'error');
        }
    })
    .catch(function(error) {
        console.error('Erro:', error);
        showAlert('Erro ao calcular totais. Verifique sua conexão.', 'error');
    });
}


function generateBill() {
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const discountPercent = parseFloat(document.getElementById('discountPercent').value || 0);
    const taxPercent = parseFloat(document.getElementById('taxPercent').value || 0);
    
    if (!customerName || !customerPhone) {
        showAlert('Nome e telefone do cliente são obrigatórios', 'error');
        if (!customerName) document.getElementById('customerName').focus();
        else document.getElementById('customerPhone').focus();
        return;
    }
    
  
    const productItems = document.getElementById('productItems');
    if (productItems.children.length === 0) {
        showAlert('Adicione pelo menos um item à fatura', 'warning');
        document.getElementById('productName').focus();
        return;
    }
    
    
    fetch('/generate_bill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            discount: discountPercent,
            tax: taxPercent
        }),
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.status === 'success') {
            
            updateBillWithCompleteData(data.invoice);
            
           
            showSuccessModal(
                'Fatura Gerada com Sucesso!', 
                `A fatura ${data.invoice.invoice_number} foi gerada e salva com sucesso.`
            );
            
           
            if (customerEmail) {
                setTimeout(function() {
                    showAlert(`Fatura enviada com sucesso para ${customerEmail}!`, 'success');
                }, 1000);
            }
            
            
            document.getElementById('successOk').addEventListener('click', clearFields, { once: true });
        } else {
           
            showAlert(data.message, 'error');
        }
    })
    .catch(function(error) {
        console.error('Erro:', error);
        showAlert('Erro ao gerar fatura. Verifique sua conexão.', 'error');
    });
}


function updateBillWithCompleteData(invoice) {
    const billContent = document.getElementById('billContent');
    
  
    const formattedDate = new Date(invoice.date).toLocaleDateString('pt-BR');
    

    let content = '';
    content += `FATURA Nº: ${invoice.invoice_number}\n`;
    content += `Data: ${formattedDate}\n`;
    content += `--------------------------------------------------\n`;
    content += `Cliente: ${invoice.customer.name}\n`;
    content += `Telefone: ${invoice.customer.phone}\n`;
    
    if (invoice.customer.email) {
        content += `Email: ${invoice.customer.email}\n`;
    }
    
    content += `--------------------------------------------------\n`;
    content += 'Produto                  Qtd     Preço    Total\n';
    content += `--------------------------------------------------\n`;
    
    
    invoice.items.forEach(function(item) {
        content += `${item.name.padEnd(24)} ${item.quantity.toString().padStart(3)}   R$${item.price.toFixed(2).padStart(6)}\n`;
    });
    
   
    content += `\n`;
    content += `────────────────────────────────────\n`;
    content += `TOTAL:${' '.repeat(25)}R$ ${invoice.total.toFixed(2)}\n`;
    content += `────────────────────────────────────\n\n`;
  
    content += `--------------------------------------------------\n`;
    content += `Subtotal:${' '.repeat(32)}R$ ${invoice.subtotal.toFixed(2)}\n`;
    
    if (invoice.discount.percent > 0) {
        content += `Desconto (${invoice.discount.percent}%):${' '.repeat(20)}R$ -${invoice.discount.amount.toFixed(2)}\n`;
    }
    
    if (invoice.tax.percent > 0) {
        content += `Imposto (${invoice.tax.percent}%):${' '.repeat(22)}R$ ${invoice.tax.amount.toFixed(2)}\n`;
    }
    
    content += `--------------------------------------------------\n`;
    content += `TOTAL:${' '.repeat(35)}R$ ${invoice.total.toFixed(2)}\n`;
    content += `--------------------------------------------------\n\n`;
    

    content += `Obrigado por escolher nossos serviços!\n`;
    content += `Para suporte: contato@empresa.com.br\n`;
    content += `Tel: (11) 5555-5555\n`;
    

    billContent.innerHTML = content;
}


function clearFields() {
    
    fetch('/clear', {
        method: 'POST',
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.status === 'success') {
      
            document.getElementById('invoiceNumber').textContent = data.new_invoice_number;
            
       
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('customerEmail').value = '';
            
          
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productQuantity').value = '1';
            
         
            document.getElementById('discountPercent').value = '0';
            document.getElementById('taxPercent').value = '0';
            

            document.getElementById('productItems').innerHTML = '';
            
         
            checkEmptyProductList();
            
          
            updateBillHeader();
            
           
            document.getElementById('totalItems').textContent = '0';
            document.getElementById('totalQuantity').textContent = '0';
            document.getElementById('subtotalValue').textContent = 'R$ 0,00';
            document.getElementById('totalValue').textContent = 'R$ 0,00';
            
            
            showAlert('Todos os dados foram limpos com sucesso', 'success');
        } else {
            showAlert('Erro ao limpar dados', 'error');
        }
    })
    .catch(function(error) {
        console.error('Erro:', error);
        showAlert('Erro ao limpar dados. Verifique sua conexão.', 'error');
    });
}


function exitApp() {
    window.location.href = '/';
}