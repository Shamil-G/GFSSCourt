from flask import render_template, request, redirect, url_for, g
from flask_login import login_required
from main_app import app, log


from model.overpayments import *

log.info("Routes-OverPayments стартовал...")


@app.route('/list_op', methods=['POST', 'GET'])
@login_required
def view_list_overpayments():
    order_num = None
    # pretrial_items = []

    order_num = request.form.get('order_num')

    list_op = list_overpayments()

    log.info(f"LIST_OVERPAYMENTS\n\tORDER_NUM: {order_num}")
    return render_template("list_overpayments.html", list_op=list_op, selected_order=order_num)


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


@app.route('/form_fragment')
def pretrial_form_fragment():
    form_type = request.args.get('form')
    order_num = request.args.get('order_num')

    log.info(f'PRETRIAL_FORM_FRAGMENT\n\tFORM_TYPE: {form_type}\n\tORDER_NUM: {order_num}')

    match form_type:
        case 'pretrial':
            return render_template('partial_forms/_pretrial_form.html', order_num=order_num)
        case 'scammer':
            return render_template('partial_forms/_scammer_form.html', order_num=order_num)
        case 'law':
            return render_template('partial_forms/_law_form.html', order_num=order_num)
        case 'court_crime':
            return render_template('partial_forms/_court_crime_form.html', order_num=order_num)
        case 'court_civ':
            return render_template('partial_forms/_court_civ_form.html', order_num=order_num)
        case 'appeal':
            return render_template('partial_forms/_appeal_form.html', order_num=order_num)
        case 'execution':
            return render_template('partial_forms/_execution_form.html', order_num=order_num)
        case 'refunding':
            return render_template('partial_forms/_refunding_form.html', order_num=order_num)
        case _:
            return render_template('partial_forms/_pretrial_form.html', order_num=order_num)


@app.route('/pretrial_fragment')
@login_required
def view_pretrial_fragment():
    order_num = request.args.get('order_num')
    pretrial_items = get_pretrial_items(order_num) if order_num else []
    log.info(f"PRETRIAL_FRAGMENT\n\tORDER_NUM: {order_num}\n\tPRETRIAL_ITEMS: {pretrial_items}")
    return render_template("partials/_pretrial_fragment.html", pretrial_items=pretrial_items, selected_order=order_num)


@app.route('/add_pretrial', methods=['POST'])
@login_required
def view_pretrial_add():
    order_num = request.form['order_num']
    date_pretrial = request.form['agreement_date']
    until_day = request.form.get('until_day', '')
    maturity_date = request.form.get('execution_date', '')
    log.info(f'-------------->>>\n\tADD PRETRIAL. ORDER_NUM: {order_num}\n\tUNTIL_DAY: {until_day}\n\tMATURITY_date: {maturity_date}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_pta(order_num, date_pretrial, until_day, maturity_date, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num))


@app.route('/scammer_fragment')
@login_required
def view_scammer_fragment():
    order_num = request.args.get('order_num')
    scammer_items = get_scammer_items(order_num) if order_num else []
    log.info(f"SCAMMER_FRAGMENT\n\tORDER_NUM: {order_num}\n\tSCAMMER_ITEMS: {scammer_items}")
    return render_template("partials/_scammer_fragment.html", scammer_items=scammer_items, selected_order=order_num)


@app.route('/add_scammer', methods=['POST'])
@login_required
def view_scammer_add():
    order_num = request.form['order_num']
    iin = request.form.get('iin', '')
    scammer_org_name = request.form.get('scammer_org_name', '')
    active_tab = request.form.get('active_tab', 'scammer')  # читаем вкладку, если была передана

    log.info(f'-------------->>>\n\tADD SCAMMER. ORDER_NUM: {order_num}\n\tIIN: {iin}\n\tSCAMMER_ORG_NAME: {scammer_org_name}')

    if order_num and g.user.full_name:
        add_scammer(order_num, iin, scammer_org_name, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab=active_tab))


@app.route('/add_law', methods=['POST'])
@login_required
def view_law_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']

    log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

    decision_date = request.form.get('decision_date')
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


@app.route('/add_court_crime', methods=['POST'])
@login_required
def view_court_crime_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']
    verdict_date = request.form.get('verdict_date','')
    compensated_amount = request.form.get('compensated_amount','')
    solution_crime_part = request.form.get('solution_crime_part','')
    solution_civ_part = request.form.get('solution_civ_part','')
    court_name = request.form.get('court_name','')

    log.info(f'----->\n\tADD CRIME COURT\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_crime_court(order_num, submission_date, verdict_date, compensated_amount, solution_crime_part, solution_civ_part, court_name, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='court_crime'))


@app.route('/court_crime_fragment')
@login_required
def view_court_crime_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_crime_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_court_crime_fragment.html", court_crime_items=court_items, selected_order=order_num)


@app.route('/add_court_civ', methods=['POST'])
@login_required
def view_court_civ_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']
    solution_date = request.form.get('solution_date','')
    num_solution = request.form.get('num_solution','')
    solution = request.form.get('solution','')
    court_name = request.form.get('court_name','')

    log.info(f'----->\n\tADD CIV COURT\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_civ_court(order_num, submission_date, solution_date, num_solution, solution, court_name, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='court_civ'))


@app.route('/court_civ_fragment')
@login_required
def view_court_civ_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_civ_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_court_civ_fragment.html", court_civ_items=court_items, selected_order=order_num)


@app.route('/add_appeal', methods=['POST'])
@login_required
def view_appeal_add():
    order_num = request.form.get('order_num')
    appeal_date = request.form.get('appeal_date')
    appeal_solution = request.form.get('appeal_solution','')
    cassation_appeal_solution = request.form.get('cassation_appeal_solution','')
    court_name = request.form.get('court_name','')

    log.info(f"----->\n\tADD APPEAL COURT\n\tORDER_NUM: {order_num}\n\tAPPEAL_SOLUTION: {appeal_solution}"
             f"\n\tCASSATION_APPEAL_SOLUTION: {cassation_appeal_solution}\n\tCOURT_NAME: {court_name}\n\tUSER: {g.user.full_name}")
    if order_num and g.user.full_name:
        add_appeal(order_num, appeal_date, appeal_solution, cassation_appeal_solution, court_name, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='appeal'))


@app.route('/appeal_fragment')
@login_required
def view_appeal_fragment():
    order_num = request.args.get('order_num')
    appeal_items = get_appeal_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {appeal_items}")
    return render_template("partials/_appeal_fragment.html", appeal_items=appeal_items, selected_order=order_num)


@app.route('/add_execution', methods=['POST'])
@login_required
def view_execution_add():
    order_num = request.form.get('order_num')
    transfer_date = request.form.get('transfer_date','')
    start_date = request.form.get('start_date','')
    phone = request.form.get('phone','')
    court_executor = request.form.get('court_executor','')

    log.info(f'----->\n\tADD EXECUTION\n\tFORM: {request.form}')

    log.info(f'----->\n\tADD EXECUTION\n\tORDER_NUM: {order_num}\n\tTRANSFER_DATE: {transfer_date}\n\tSTART_DATE: {start_date}\n\tPHONE: {phone}\n\tCOURT_EXECUTOR: {court_executor}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_execution(order_num, transfer_date, start_date, phone, court_executor, g.user.full_name)      
    # Сохраняем в БД или обрабатываем
    return redirect(url_for('view_list_overpayments', order_num=order_num, tab='execution'))


@app.route('/execution_fragment')
@login_required
def view_execution_fragment():
    order_num = request.args.get('order_num')
    execution_items = get_execution_items(order_num) if order_num else []
    log.info(f"EXECUTION_FRAGMENT\n\tORDER_NUM: {order_num}\n\tEXECUTION_ITEMS: {execution_items}")
    return render_template("partials/_execution_fragment.html", execution_items=execution_items, selected_order=order_num)


@app.route('/add_refunding', methods=['POST'])
@login_required
def view_refunding_add():
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


@app.route('/refunding_fragment')
@login_required
def view_refunding_fragment():
    order_num = request.args.get('order_num')
    refunding_items = get_refunding_items(order_num) if order_num else []
    log.info(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {refunding_items}")
    return render_template("partials/_refunding_fragment.html", refunding_items=refunding_items, selected_order=order_num)
