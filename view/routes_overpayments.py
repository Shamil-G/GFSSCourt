from flask import render_template, request, redirect, url_for, g
from flask_login import login_required
from main_app import app, log


from model.overpayments import *

log.info("Routes-OverPayments стартовал...")


@app.route('/list_op', methods=['POST', 'GET'])
@login_required
def view_list_overpayments():
    order_num = None
    pretrial_items = []

    if request.method == "POST":
        order_num = request.form.get('order_num')
        if order_num:
            pretrial_items = get_pretrial_items(order_num)
    else:
        order_num = request.args.get('order_num')
        if order_num:
            pretrial_items = get_pretrial_items(order_num)

    list_op = list_overpayments()

    log.info(f"LIST_OVERPAYMENTS\n\tORDER_NUM: {order_num}\n\tPRETRIAL_ITEMS:\n\t{pretrial_items}\n\tLIST_OP:\n\t{list_op}")
    return render_template("list_overpayments.html", list_op=list_op, pretrial_items=pretrial_items, selected_order=order_num)



@app.route('/add_op', methods=['POST', 'GET'])
@login_required
def view_add_op():
    if request.method == 'POST':
        region = request.form['region']
        iin = request.form['iin']
        rfpm_id = request.form['rfpm_id']
        status = 'Первичный ввод'
        estimated_damage_amount = request.form['estimate_damage_amount']
        add_op(region, iin, rfpm_id, estimated_damage_amount, status)      
        return redirect(url_for('view_list_overpayments'))            
    log.info(f"ADD OP")
    return render_template("add_op.html", region=g.user.dep_name)


@app.route('/add_pretrial', methods=['POST'])
@login_required
def view_pretrial_add():
    order_num = request.form['order_num']
    date_pretrial = request.form['agreement_date']
    maturity_date = request.form['execution_date']
    log.info(f'ADD PRETRIAL. ORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_pta(date_pretrial, order_num, maturity_date, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num))


@app.route('/form_fragment')
def pretrial_form_fragment():
    form_type = request.args.get('form')
    order_num = request.args.get('order_num')

    match form_type:
        case 'pretrial':
            return render_template('partial_forms/_pretrial_form.html', order_num=order_num)
        case 'law':
            return render_template('partial_forms/_law_form.html', order_num=order_num)
        case 'court':
            return render_template('partial_forms/_court_form.html', order_num=order_num)
        case 'appeal':
            return render_template('partial_forms/_appeal_form.html', order_num=order_num)
        case 'execution':
            return render_template('partial_forms/_execution_form.html', order_num=order_num)
        case _:
            return render_template('partial_forms/_pretrial_form.html', order_num=order_num)

    log.info(f'PRETRIAL_FORM_FRAGMENT\n\tFORM_TYPE: {form_type}\n\tORDER_NUM: {order_num}')
    return render_template('partial_forms/_pretrial_form.html', order_num=order_num)


@app.route('/pretrial_fragment')
@login_required
def view_pretrial_fragment():
    order_num = request.args.get('order_num')
    pretrial_items = get_pretrial_items(order_num) if order_num else []
    log.info(f"PRETRIAL_FRAGMENT\n\tORDER_NUM: {order_num}\n\tPRETRIAL_ITEMS: {pretrial_items}")
    return render_template("partials/_pretrial_fragment.html", pretrial_items=pretrial_items, selected_order=order_num)


@app.route('/add_law', methods=['POST'])
@login_required
def view_law_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

    decision_date = request.form['decision_date']
    decision = request.form['decision']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tdecision: {decision}')

    orgname = request.form['orgname']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_law(order_num, submission_date, decision_date, decision, orgname, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='law'))

@app.route('/law_fragment')
@login_required
def view_law_fragment():
    order_num = request.args.get('order_num')
    law_items = get_law_items(order_num) if order_num else []
    log.info(f"LAW_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {law_items}")
    return render_template("partials/_law_fragment.html", law_items=law_items, selected_order=order_num)


@app.route('/add_court', methods=['POST'])
@login_required
def view_court_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

    decision_date = request.form['decision_date']
    decision = request.form['decision']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tdecision: {decision}')

    orgname = request.form['orgname']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_law(order_num, submission_date, decision_date, decision, orgname, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='law'))


@app.route('/court_fragment')
@login_required
def view_court_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_court_fragment.html", court_items=court_items, selected_order=order_num)


@app.route('/add_appeal', methods=['POST'])
@login_required
def view_appeal_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

    decision_date = request.form['decision_date']
    decision = request.form['decision']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tdecision: {decision}')

    orgname = request.form['orgname']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_law(order_num, submission_date, decision_date, decision, orgname, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='law'))


@app.route('/appeal_fragment')
@login_required
def view_appeal_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_appeal_fragment.html", court_items=court_items, selected_order=order_num)


@app.route('/add_execution', methods=['POST'])
@login_required
def view_execution_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

    decision_date = request.form['decision_date']
    decision = request.form['decision']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tdecision: {decision}')

    orgname = request.form['orgname']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_law(order_num, submission_date, decision_date, decision, orgname, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='law'))


@app.route('/execution_fragment')
@login_required
def view_execution_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_execution_fragment.html", court_items=court_items, selected_order=order_num)
