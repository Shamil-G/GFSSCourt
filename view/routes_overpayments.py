from flask import render_template, request, redirect, url_for, g, jsonify
from flask_login import login_required
from main_app import app, log
from util.i18n import get_i18n_value


from model.overpayments import *

log.info("Routes-OverPayments стартовал...")


@app.route('/list_op', methods=['POST', 'GET'])
@login_required
def view_list_overpayments():
    order_num = request.form.get('order_num','')
    log.info(f"LIST_OVERPAYMENTS. ORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}\n\tTOP_CONTROL: {g.user.top_control}\n\tDEPNAME: {g.user.dep_name}")
    list_op = list_overpayments(g.user.top_control, g.user.dep_name)

    log.info(f"LIST_OVERPAYMENTS\n\list_op: {list_op}")
    return render_template("list_overpayments.html", list_op=list_op, selected_order=order_num)


@app.route('/add_op', methods=['POST', 'GET'])
@login_required
def view_add_op():
    if request.method == 'POST':
        region = request.form.get('region','')
        iin = request.form.get('iin', '')
        risk_date = request.form.get('risk_date','')
        rfpm_id = request.form.get('rfpm_id', '')
        sum_civ_amount = request.form.get('sum_civ_amount','')
        add_op(region, iin, risk_date, rfpm_id, sum_civ_amount)      
        return redirect(url_for('view_list_overpayments'))            
    log.debug(f"ADD OP. REGION: {g.user.dep_name}, TTOP_CONTROL: {g.user.top_control}")
    return render_template("add_op.html", region=g.user.dep_name, top_control=g.user.top_control)


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
    log.debug(f"PRETRIAL_FRAGMENT\n\tORDER_NUM: {order_num}\n\tPRETRIAL_ITEMS: {pretrial_items}")
    return render_template("partials/_pretrial_fragment.html", pretrial_items=pretrial_items, selected_order=order_num)


@app.route('/add_pretrial', methods=['POST'])
@login_required
def view_pretrial_add():
    order_num = request.form['order_num']
    date_pretrial = request.form['agreement_date']
    until_day = request.form.get('until_day', '')
    maturity_date = request.form.get('execution_date', '')
    log.debug(f'-------------->>>\n\tADD PRETRIAL. ORDER_NUM: {order_num}\n\tUNTIL_DAY: {until_day}\n\tMATURITY_date: {maturity_date}\n\tUSER: {g.user.full_name}')
    if date_pretrial=='' or (until_day=='' and maturity_date==''):
        return { "success":  False, "message": "Не все поля заполнены:\n'Каждый месяц до' или 'Дата погашения'?" }, 200
    if order_num and g.user.full_name:
        add_pta(order_num, date_pretrial, until_day, maturity_date, g.user.full_name)      
        return { "success":  True }, 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "ADD PRETRIAL. ORDER NUM is empty?" }, 200
    # return redirect(url_for('view_list_overpayments', order_num=order_num))


@app.route('/scammer_fragment')
@login_required
def view_scammer_fragment():
    order_num = request.args.get('order_num')
    scammer_items = get_scammer_items(order_num) if order_num else []
    log.debug(f"SCAMMER_FRAGMENT\n\tORDER_NUM: {order_num}\n\tSCAMMER_ITEMS: {scammer_items}")
    return render_template("partials/_scammer_fragment.html", scammer_items=scammer_items, selected_order=order_num)


@app.route('/add_scammer', methods=['POST'])
@login_required
def view_scammer_add():
    order_num = request.form['order_num']
    iin = request.form.get('iin', '')
    scammer_org_name = request.form.get('scammer_org_name', '')

    log.debug(f'-------------->>>\n\tADD SCAMMER. ORDER_NUM: {order_num}\n\tIIN: {iin}\n\tSCAMMER_ORG_NAME: {scammer_org_name}')
    if iin=='' or scammer_org_name=='':
        return { "success":  False, "message": "Не все поля заполнены:\nИИН, Организация-мошенник?" }, 200
    if order_num and g.user.full_name:
        add_scammer(order_num, iin, scammer_org_name, g.user.full_name)      
        return { "success":  True }, 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "ADD PRETRIAL. ORDER NUM is empty?" }, 200
    # return redirect(url_for('view_list_overpayments', order_num=order_num, tab=active_tab))


@app.route('/add_law', methods=['POST'])
@login_required
def view_law_add():
    order_num = request.form.get('order_num')
    submission_date = request.form.get('submission_date','')
    decision_date = request.form.get('decision_date','')
    effective_date = request.form.get('effective_date','')

    decision = request.form.get('decision','')
    orgname = request.form.get('orgname','')

    log.debug(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if submission_date=='':
        log.info(f'----->\n\tADD LAW\n\tSUBMISSION_DATE and DECISION_DATE is NULL')
        return jsonify({ "success": False, "messages": ["⚠️ Вы должны не указали <Дата обращения>"] }), 200
    if decision_date!='' and (decision=='' or orgname==''):
            log.info(f'----->\n\tADD LAW\n\t{get_i18n_value('MUST_BE_ALL_FIELD')}')
            return jsonify({ "success": False, "messages": [ get_i18n_value('MUST_BE_ALL_FIELD') ] }), 200
    if order_num and g.user.full_name:
        add_law(order_num, submission_date, decision_date, effective_date, decision, orgname, g.user.full_name)      
        return { "success": True }, 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "Не все поля заполнены\n'Решение ПО' или 'Правоохранительный орган'?" }, 200


@app.route('/law_fragment')
@login_required
def view_law_fragment():
    order_num = request.args.get('order_num')
    law_items = get_law_items(order_num) if order_num else []
    log.debug(f"LAW_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {law_items}")
    return render_template("partials/_law_fragment.html", law_items=law_items, selected_order=order_num)


@app.route('/add_court_crime', methods=['POST'])
@login_required
def view_court_crime_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']
    verdict_date = request.form.get('verdict_date','')
    effective_date = request.form.get('effective_date','')
    sum_civ_amount = request.form.get('sum_civ_amount','')
    compensated_amount = request.form.get('compensated_amount','')
    solution_crime_part = request.form.get('solution_crime_part','')
    solution_civ_part = request.form.get('solution_civ_part','')
    court_name = request.form.get('court_name','')

    log.debug(f'----->\n\tADD COURT\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if submission_date=='':
        return jsonify({ "success": False, "messages": ["⚠️ Вы должны ввести дату в поле <Дата обращения>"] }), 200

    if order_num and g.user.full_name:
        add_crime_court(order_num, submission_date, verdict_date, effective_date, sum_civ_amount, compensated_amount, 
                        solution_crime_part, solution_civ_part, court_name, g.user.full_name)      
        return jsonify({ "success": True }), 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "ADD CRIME. ⚠️ Не все поля заполнены" }, 200


@app.route('/court_crime_fragment')
@login_required
def view_court_crime_fragment():
    order_num = request.args.get('order_num')
    court_items = get_court_crime_items(order_num) if order_num else []
    log.debug(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {court_items}")
    return render_template("partials/_court_crime_fragment.html", court_crime_items=court_items, selected_order=order_num)


@app.route('/add_court_civ', methods=['POST'])
@login_required
def view_court_civ_add():
    order_num = request.form.get('order_num')
    submission_date = request.form['submission_date']
    solution_date = request.form.get('solution_date','')
    effective_date = request.form.get('effective_date','')
    num_solution = request.form.get('num_solution','')
    solution = request.form.get('solution','')
    court_name = request.form.get('court_name','')

    log.debug(f'----->\n\tADD CIV\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if submission_date=='':
        log.info(f'----->\n\tADD LAW\n\tSUBMISSION_DATE and VERDICT_DATE is NULL')
        return jsonify({ "success": False, "messages": ["⚠️ Вы должны указать <Дата обращения>"] }), 200
    if solution!='' and solution_date=='':
        log.info(f'----->\n\tADD LAW\n\tDECISION and SOLUTION_DATE cant be NULL at once')
        return jsonify({ "success": False, "messages": ["⚠️ При вынесении решения должна быть указана <Дата решения>"] }), 200
    if solution_date!='':
        if solution=='' or court_name=='' or submission_date=='':
            log.info(f'----->\n\tADD LAW\n\t{get_i18n_value('MUST_BE_ALL_FIELD')}')
            return jsonify({ "success": False, "messages": [ get_i18n_value('MUST_BE_ALL_FIELD') ] }), 200
    if order_num and g.user.full_name:
        add_civ_court(order_num, submission_date, solution_date, effective_date, num_solution, solution, court_name, g.user.full_name)      
        return jsonify({ "success": True }), 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "ADD CIV. ⚠️ Не все поля заполнены" }, 200


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
    effective_date = request.form.get('effective_date','')
    appeal_solution = request.form.get('appeal_solution','')
    cassation_appeal_solution = request.form.get('cassation_appeal_solution','')
    court_name = request.form.get('court_name','')

    log.debug(f"----->\n\tADD APPEAL COURT\n\tORDER_NUM: {order_num}\n\tAPPEAL_SOLUTION: {appeal_solution}"
             f"\n\tCASSATION_APPEAL_SOLUTION: {cassation_appeal_solution}\n\tCOURT_NAME: {court_name}\n\tUSER: {g.user.full_name}")
    if order_num and g.user.full_name:
        add_appeal(order_num, appeal_date, effective_date, appeal_solution, cassation_appeal_solution, court_name, g.user.full_name)
        return jsonify({ "success": True }), 200
    # Сохраняем в БД или обрабатываем
    return jsonify({ "success": False, "message": "Поле ORDER_NUM is empty?" }), 200
    # return redirect(url_for('view_list_overpayments', order_num=order_num, tab='appeal'))


@app.route('/appeal_fragment')
@login_required
def view_appeal_fragment():
    order_num = request.args.get('order_num')
    appeal_items = get_appeal_items(order_num) if order_num else []
    log.debug(f"COURT_FRAGMENT\n\tORDER_NUM: {order_num}\n\tLAW_ITEMS: {appeal_items}")
    return render_template("partials/_appeal_fragment.html", appeal_items=appeal_items, selected_order=order_num)


@app.route('/add_execution', methods=['POST'])
@login_required
def view_execution_add():
    order_num = request.form.get('order_num')
    transfer_date = request.form.get('transfer_date','')
    start_date = request.form.get('start_date','')
    phone = request.form.get('phone','')
    court_executor = request.form.get('court_executor','')

    log.debug(f'----->\n\tADD EXECUTION\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
    if transfer_date=='' and start_date=='':
        log.info(f'----->\n\tADD LAW\n\tTRANSFER_DATE and START_DATE is NULL')
        return jsonify({ "success": False, "messages": ["⚠️ Вы должны указать одно из двух полей:\n<Дата передачи> или <Дата исполнения>"] }), 200

    log.debug(f'----->\n\tADD EXECUTION\n\tORDER_NUM: {order_num}\n\tTRANSFER_DATE: {transfer_date}\n\tSTART_DATE: {start_date}\n\tPHONE: {phone}\n\tCOURT_EXECUTOR: {court_executor}\n\tUSER: {g.user.full_name}')
    if order_num and g.user.full_name:
        add_execution(order_num, transfer_date, start_date, phone, court_executor, g.user.full_name)      
        return { "success": True }, 200
    # Сохраняем в БД или обрабатываем
    return { "success":  False, "message": "ADD EXECUTION. ⚠️ Не все поля заполнены" }, 200


@app.route('/execution_fragment')
@login_required
def view_execution_fragment():
    order_num = request.args.get('order_num')
    execution_items = get_execution_items(order_num) if order_num else []
    log.debug(f"EXECUTION_FRAGMENT\n\tORDER_NUM: {order_num}\n\tEXECUTION_ITEMS: {execution_items}")
    return render_template("partials/_execution_fragment.html", execution_items=execution_items, selected_order=order_num)


# @app.route('/add_refunding', methods=['POST'])
# @login_required
# def view_refunding_add():
#     order_num = request.form.get('order_num')
#     submission_date = request.form['submission_date']

#     log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tsubmission_date: {submission_date}')

#     decision_date = request.form['decision_date']
#     decision = request.form['decision']

#     log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tdecision: {decision}')

#     orgname = request.form['orgname']

#     log.info(f'----->\n\tADD LAW\n\tORDER_NUM: {order_num}\n\tUSER: {g.user.full_name}')
#     if order_num and g.user.full_name:
#         add_law(order_num, submission_date, decision_date, decision, orgname, g.user.full_name)      
#         return { "success": True }, 200
#     # Сохраняем в БД или обрабатываем
#     return { "success": False, "message": "Тестовый режим" }, 200
#     # return redirect(url_for('view_list_overpayments', order_num=order_num, tab='law'))


@app.route('/refunding_fragment')
@login_required
def view_refunding_fragment():
    order_num = request.args.get('order_num')
    log.info(f"REFUNDING_FRAGMENT\n\tORDER_NUM: {order_num}")
    refunding_items = get_refunding_items(order_num) if order_num else []
    log.info(f"REFUNDING_FRAGMENT\n\tORDER_NUM: {order_num}\n\tREFUNDING_ITEMS: {refunding_items}")
    return render_template("partials/_refunding_fragment.html", refunding_items=refunding_items, selected_order=order_num)
