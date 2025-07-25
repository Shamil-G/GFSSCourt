from    util.logger import log
from    db.connect import get_connection



def list_overpayments(top_control, user_region):
    if top_control:      
        stmt = """
                select op.op_id,
                     op.region, 
                     p.lastname||' '||p.firstname||' '||p.middlename as fio,
                     op.iin,  
                     to_char(op.estimated_damage_amount,'999999990.99'),
                     to_char(coalesce(op.compensated_amount,0),'9999990.99'),
                     to_char(coalesce(op.court_damage_amount,0),'999999990.99'),
                     op.rfpm_id,
                     op.last_status,
                     to_char(op.verdict_date,'dd.mm.yyyy'),
                     op.last_source_solution,
                     op.last_solution,
                     op.employee
                from overpayments op, loader.person p
                where op.iin=p.iin(+)
            """
    else:
        stmt = """
                select op.op_id,
                     op.region, 
                     p.lastname||' '||p.firstname||' '||p.middlename as fio,
                     op.iin,  
                     to_char(op.estimated_damage_amount,'999999990.99'),
                     to_char(coalesce(op.compensated_amount,0),'9999990.99'),
                     to_char(coalesce(op.court_damage_amount,0),'999999990.99'),
                     op.rfpm_id,
                     op.last_status,
                     to_char(op.verdict_date,'dd.mm.yyyy'),
                     op.last_source_solution,
                     op.last_solution,
                     op.employee
                from overpayments op, loader.person p
                where op.iin=p.iin(+)
                and op.region=:region
            """
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if top_control:
                cursor.execute(stmt)
            else:
                cursor.execute(stmt, region=user_region)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'order_num': rec[0], 'region': rec[1], 'fio': rec[2], 'iin': rec[3], 'estimated_amount': rec[4], 'compensated_amount': rec[5],
                       'court_amount': rec[6], 'rfpm_id': rec[7], 'last_status': rec[8], 'verdict_date': rec[9] or '', 
                       'last_source_solution': rec[10] or '-//-', 
                       'last_solution': rec[11] or '-//-',
                       'employee': rec[12]}
                result.append(res)
            return result


def get_pretrial_items(order_num):
    stmt = """
        select op_id, to_char(date_pretrial,'dd.mm.yyyy HH24'), until_day, to_char(maturity_date,'dd.mm.yyyy HH24'), employee
        from pt_agreements pt
        where pt.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET PRETRIAL ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'pretrial_date': rec[1], 'until_day': rec[2] or '-//-', 'maturity_date': rec[3] or '-//-', 'employee': rec[4] }
                result.append(res)
            log.info(f'------ GET PRETRIAL ITEMS. RESULT:\n\t{result}')
            return result


def get_scammer_items(order_num):
    stmt = """
        select op_id, 
            pt.iin, 
            p.lastname||' '||p.firstname||' '||p.middlename as fio,
            scammer_org_name, employee
        from scammers pt, loader.person p
        where pt.op_id=:op_id
        and   pt.iin=p.iin(+)
    """
    if not order_num:
        log.info(f'------ GET PRETRIAL ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'iin': rec[1], 'scammer_fio': rec[2] or 'Нет в таблице LOADER.PERSON', 'scammer_org_name': rec[3], 'employee': rec[4] }
                result.append(res)
            log.info(f'------ GET SCAMMER ITEMS. RESULT:\n\t{result}')
            return result


def get_law_items(order_num):
    stmt = """
        select op_id, 
               to_char(submission_date,'dd.mm.yyyy HH24'), 
               to_char(decision_date,'dd.mm.yyyy HH24'), 
               decision,
               org_name,
               employee
        from law_decisions pt
        where pt.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET LAW ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'submission_date': rec[1], 'decision_date': rec[2], 'decision': rec[3], 'orgname': rec[4], 'employee': rec[5] }
                result.append(res)
            log.info(f'------ GET LAW ITEMS. RESULT:\n\t{result}')
            return result


def get_court_crime_items(order_num):
    stmt = """
        select op_id, 
               to_char(submission_date,'dd.mm.yyyy HH24') as submission_date, 
               to_char(verdict_date,'dd.mm.yyyy HH24') as verdict_date, 
               estimated_damage_amount,
               compensated_amount,
               solution_crime_part,
               solution_civ_part,
               court_name,
               employee
        from crime_court cc
        where cc.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET CRIME COURT ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'submission_date': rec[1], 
                       'verdict_date': rec[2], 'estimated_damage_amount': rec[3], 'compensated_amount': rec[4], 
                       'solution_crime_part': rec[5], "solution_civ_part": rec[6], 'court_name': rec[7],
                       'employee': rec[8] }
                result.append(res)
            log.info(f'------ GET CRIME COURT ITEMS. RESULT:\n\t{result}')
            return result


def get_court_civ_items(order_num):
    stmt = """
        select op_id, 
               to_char(submission_date,'dd.mm.yyyy HH24') as submission_date, 
               to_char(solution_date,'dd.mm.yyyy HH24') as solution_date, 
               num_solution,
               solution,
               court_name,
               employee
        from civ_court cc
        where cc.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET CIV COURT ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'submission_date': rec[1], 'solution_date': rec[2], 'num_solution': rec[3], 'solution': rec[4], 'court_name': rec[5], 'employee': rec[6] }
                result.append(res)
            log.info(f'------ GET CIV COURT ITEMS. RESULT:\n\t{result}')
            return result


def get_appeal_items(order_num):
    stmt = """
        select op_id,
               to_char(appeal_date,'dd.mm.yyyy HH24') as appeal_date,
               appeal_solution, 
               cassation_appeal_solution, 
               court_name,
               employee
        from appeal_court ac
        where ac.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET APPEAL COURT ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'appeal_date': rec[1], 'appeal_solution': rec[2], 'cassation_appeal_solution': rec[3], 'court_name': rec[4], 'employee': rec[5] }
                result.append(res)
            log.info(f'------ GET APPEAL COURT ITEMS. RESULT:\n\t{result}')
            return result


def get_execution_items(order_num):
    stmt = """
        select op_id, 
               to_char(transfer_date,'dd.mm.yyyy HH24'), 
               to_char(start_date,'dd.mm.yyyy HH24'), 
               phone,
               court_executor,
               employee
        from executions pt
        where pt.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET LAW ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'transfer_date': rec[1], 'start_date': rec[2], 'phone': rec[3], 'court_executor': rec[4], 'employee': rec[5], }
                result.append(res)
            log.info(f'------ GET LAW ITEMS. RESULT:\n\t{result}')
            return result


def get_refunding_items(order_num):
    stmt = """
        select op_id, 
               to_char(submission_date,'dd.mm.yyyy HH24'), 
               to_char(decision_date,'dd.mm.yyyy HH24'), 
               decision,
               org_name,
               employee
        from law_decisions pt
        where pt.op_id=:op_id
    """
    if not order_num:
        log.info(f'------ GET LAW ITEMS\n\tORDER_NUM is EMPTY')
        return []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt, op_id=order_num)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'op_id': rec[0], 'submission_date': rec[1], 'decision_date': rec[2], 'decision': rec[3], 'orgname': rec[4], 'employee': rec[5], }
                result.append(res)
            log.info(f'------ GET LAW ITEMS. RESULT:\n\t{result}')
            return result


def add_op(region, iin, rfpm_id, estimated_damage_amount, last_status):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_op(:region, :iin, :rfpm_id, :estimated_damage_amount, :last_status); end;', 
                           region=region, iin=iin, rfpm_id=rfpm_id, estimated_damage_amount=estimated_damage_amount, 
                           last_status=last_status)
            finally:
                log.info(f'ADD_OVERPAYMENTS\n\tINN: {iin}\n\tREGION: {region}\n\tEstimated_damage_amount: {estimated_damage_amount}')


def add_pta(op_id, date_pretrial, until_day, maturity_date, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_pta(:op_id, :date_pretrial, :until_day, :maturity_date, :employee); end;', 
                               op_id=op_id, date_pretrial=date_pretrial, until_day=until_day, maturity_date=maturity_date, employee=employee)
            finally:
                log.info(f'ADD_PRETRIAL\n\tDATE_PRETRIAL: {date_pretrial}\n\tOP_ID: {op_id}\n\tmaturity_date: {maturity_date}\n\temployee: {employee}')


def add_scammer(op_id, iin, scammer_org_name, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_scammer(:op_id, :iin, :scammer_org_name, :employee); end;', 
                               op_id=op_id, iin=iin, scammer_org_name=scammer_org_name, employee=employee)
            finally:
                log.info(f'ADD_SCAMMER\n\tOP_ID: {op_id}\n\tIIN: {iin}\n\tSCAMMER_ORG_NAME: {scammer_org_name}\n\temployee: {employee}')


def add_law(op_id, submission_date, decision_date, decision, orgname, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_law(:op_id, :submission_date, :decision_date, :decision, :orgname, :employee); end;', 
                               op_id=int(op_id), submission_date=submission_date, 
                               decision_date=decision_date, decision=decision, orgname=orgname, employee=employee)
            finally:
                log.info(f'ADD_LAW\n\tOP_ID: {op_id}\n\tSUBMISSION_DATE: {submission_date}\n\tDECISION_DATE: {decision_date}\n\tDECISION: {decision}\n\tORGNAME: {orgname}\n\temployee: {employee}')


def add_crime_court(op_id, submission_date, verdict_date, compensated_amount, solution_crime_part, solution_civ_part, court_name, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_crime_court(:op_id, :submission_date, :verdict_date, :compensated_amount, :solution_crime_part, :solution_civ_part, :court_name, :employee); end;', 
                               op_id=op_id, submission_date=submission_date, 
                               verdict_date=verdict_date, compensated_amount=compensated_amount, solution_crime_part=solution_crime_part,
                               solution_civ_part=solution_civ_part, court_name=court_name, employee=employee)
            finally:
                log.info(f'ADD_CRIME_COURT\n\tOP_ID: {op_id}\n\tSUBMISSION_DATE: {submission_date}\n\tVERDICT_DATE: {verdict_date}\n\tSOLUTION_CRIME: {solution_crime_part}\n\tCOURT_NAME: {court_name}\n\temployee: {employee}')


def add_civ_court(op_id, submission_date, solution_date, num_solution, solution, court_name, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_civ_court(:op_id, :submission_date, :solution_date, :num_solution, :solution, :court_name, :employee); end;', 
                               op_id=op_id, submission_date=submission_date, 
                               solution_date=solution_date, num_solution=num_solution, solution=solution,
                               court_name=court_name, employee=employee)
            finally:
                log.info(f'ADD_CIV_COURT\n\tOP_ID: {op_id}\n\tSUBMISSION_DATE: {submission_date}\n\tSOLUTION_DATE: {solution_date}\n\tNUM_SOLUTION: {num_solution}\n\tSOLUTION: {solution}\n\tCOURT_NAME: {court_name}\n\temployee: {employee}')


def add_appeal(op_id, appeal_date, appeal_solution, cassation_appeal_solution, court_name, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_appeal(:op_id, :appeal_date, :appeal_solution, :cassation_appeal_solution, :court_name, :employee); end;', 
                               op_id=op_id, appeal_date=appeal_date, appeal_solution=appeal_solution, cassation_appeal_solution=cassation_appeal_solution, 
                               court_name=court_name, employee=employee)
            finally:
                log.info(f'ADD_LAW\n\tOP_ID: {op_id}\n\tAPPEAL_DATE: {appeal_date}\n\tAPPEAL_SOLUTION: {appeal_solution}\n\tCASSATION_APPEAL: {cassation_appeal_solution}\n\temployee: {employee}')


def add_execution(op_id, transfer_date, start_date, phone, court_executor, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_execution(:op_id, :transfer_date, :start_date, :phone, :court_executor, :employee); end;', 
                               op_id=int(op_id), 
                               transfer_date=transfer_date, 
                               start_date=start_date, 
                               phone=phone, 
                               court_executor=court_executor, employee=employee
                               )
            finally:
                log.info(f'ADD_EXECUTION\n\tOP_ID: {op_id}\n\tTRANSFER_DATE: {transfer_date}\n\tSTART_DATE: {start_date}\n\tPHONE: {phone}\n\tCOURT_EXECUTOR: {court_executor}\n\temployee: {employee}')