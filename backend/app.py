from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
import random
from datetime import datetime
import json

app = Flask(__name__, 
            static_folder='../frontend',
            template_folder='../frontend')
            
app.secret_key = 'chave_secreta_sistema_faturamento_amigavel'  


INVOICE_DIR = 'invoices'
if not os.path.exists(INVOICE_DIR):
    os.makedirs(INVOICE_DIR)

@app.route('/')
def index():
 
    if 'invoice_number' not in session:
        session['invoice_number'] = f"INV-{random.randint(10000, 99999)}"
    
 
    current_date = datetime.now().strftime("%d/%m/%Y")
    
    return render_template('index.html', 
                           invoice_number=session['invoice_number'],
                           current_date=current_date)

@app.route('/add_item', methods=['POST'])
def add_item():
  
    data = request.get_json()
    product_name = data.get('name')
    product_price = float(data.get('price'))
    product_quantity = int(data.get('quantity'))
    
  
    if not product_name or product_price <= 0 or product_quantity <= 0:
        return jsonify({'status': 'error', 'message': 'Dados inválidos'}), 400
    
  
    total = product_price * product_quantity
  
    if 'cart_items' not in session:
        session['cart_items'] = []
    
   
    cart_items = session['cart_items'].copy()
    
  
    cart_items.append({
        'name': product_name,
        'price': product_price,
        'quantity': product_quantity,
        'total': total
    })
    
  
    session['cart_items'] = cart_items
    
    return jsonify({
        'status': 'success', 
        'message': f"Item '{product_name}' adicionado com sucesso",
        'item': {
            'name': product_name,
            'price': product_price,
            'quantity': product_quantity,
            'total': total
        }
    })

@app.route('/calculate', methods=['POST'])
def calculate():
    
    data = request.get_json()
    discount_percent = float(data.get('discount', 0))
    tax_percent = float(data.get('tax', 0))
    
    
    if discount_percent < 0 or discount_percent > 100 or tax_percent < 0 or tax_percent > 100:
        return jsonify({'status': 'error', 'message': 'Porcentagens inválidas'}), 400
    
  
    if 'cart_items' not in session or not session['cart_items']:
        return jsonify({'status': 'error', 'message': 'Nenhum item no carrinho'}), 400
    
   
    cart_items = session['cart_items']
    subtotal = sum(item['total'] for item in cart_items)
    

    discount_amount = subtotal * (discount_percent / 100)
    tax_amount = (subtotal - discount_amount) * (tax_percent / 100)
    total_amount = subtotal - discount_amount + tax_amount
    
  
    return jsonify({
        'status': 'success',
        'subtotal': subtotal,
        'discount': {
            'percent': discount_percent,
            'amount': discount_amount
        },
        'tax': {
            'percent': tax_percent,
            'amount': tax_amount
        },
        'total': total_amount
    })

@app.route('/generate_bill', methods=['POST'])
def generate_bill():
    
    data = request.get_json()
    customer_name = data.get('name')
    customer_phone = data.get('phone')
    customer_email = data.get('email', '')
    discount_percent = float(data.get('discount', 0))
    tax_percent = float(data.get('tax', 0))
    

    if not customer_name or not customer_phone:
        return jsonify({'status': 'error', 'message': 'Nome e telefone são obrigatórios'}), 400
    
   
    if 'cart_items' not in session or not session['cart_items']:
        return jsonify({'status': 'error', 'message': 'Nenhum item no carrinho'}), 400
    
    
    cart_items = session['cart_items']
    invoice_number = session['invoice_number']
    
    
    subtotal = sum(item['total'] for item in cart_items)
    
   
    discount_amount = subtotal * (discount_percent / 100)
    tax_amount = (subtotal - discount_amount) * (tax_percent / 100)
    total_amount = subtotal - discount_amount + tax_amount
    

    invoice_data = {
        'invoice_number': invoice_number,
        'date': datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        'customer': {
            'name': customer_name,
            'phone': customer_phone,
            'email': customer_email
        },
        'items': cart_items,
        'subtotal': subtotal,
        'discount': {
            'percent': discount_percent,
            'amount': discount_amount
        },
        'tax': {
            'percent': tax_percent,
            'amount': tax_amount
        },
        'total': total_amount
    }
    
 
    current_date = datetime.now().strftime("%Y%m%d")
    filename = f"{current_date}_{invoice_number.replace('-', '_')}.json"
    filepath = os.path.join(INVOICE_DIR, filename)
    
    with open(filepath, 'w') as f:
        json.dump(invoice_data, f, indent=4)
    
    
    session.pop('cart_items', None)
    session.pop('invoice_number', None)
    
   
    return jsonify({
        'status': 'success',
        'message': f"Fatura {invoice_number} gerada com sucesso",
        'invoice': invoice_data,
        'filename': filename
    })

@app.route('/clear', methods=['POST'])
def clear():
    
    session.pop('cart_items', None)
    
    
    session['invoice_number'] = f"INV-{random.randint(10000, 99999)}"
    
    return jsonify({
        'status': 'success',
        'message': 'Dados limpos com sucesso',
        'new_invoice_number': session['invoice_number']
    })


if __name__ == '__main__':
    app.run(debug=True)