from    util.logger import log
import  db_config as cfg
from    db.connect import get_connection
import  oracledb
import  datetime
import  os.path


def list_overpayments():
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
             op.point_uk,
             op.last_source_solution,
             op.last_solution
        from overpayments op, loader.person p
        where op.iin=p.iin(+)
    """
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(stmt)
            
            result = []
            records = cursor.fetchall()
            for rec in records:
                res = {'order_num': rec[0], 'region': rec[1], 'fio': rec[2], 'iin': rec[3], 'estimated_amount': rec[4], 'compensated_amount': rec[5],
                       'court_amount': rec[6], 'rfpm_id': rec[7], 'last_status': rec[8], 'point_uk': rec[9] or '', 'last_source_solution': rec[10] or '', 'last_solution': rec[10] or ''}
                result.append(res)
            return result

def get_pretrial_items(order_num):
    stmt = """
        select to_char(date_pretrial,'dd.mm.yyyy HH24'), to_char(maturity_date,'dd.mm.yyyy HH24'), employee, op_id
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
                res = {'pretrial_date': rec[0], 'maturity_date': rec[1], 'employee': rec[2], 'op_id': rec[3]}
                result.append(res)
            log.info(f'------ GET PRETRIAL ITEMS. RESULT:\n\t{result}')
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
                res = {'op_id': rec[0], 'submission_date': rec[1], 'decision_date': rec[2], 'decision': rec[3], 'orgname': rec[4], 'employee': rec[5], }
                result.append(res)
            log.info(f'------ GET LAW ITEMS. RESULT:\n\t{result}')
            return result


def get_court_items(order_num):
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


def add_pta(date_pretrial, op_id, maturity_date, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_pta(:date_pretrial, :op_id, :maturity_date, :employee); end;', 
                               date_pretrial=date_pretrial, op_id=op_id, maturity_date=maturity_date, employee=employee)
            finally:
                log.info(f'ADD_OVERPAYMENTS\n\tDATE_PRETRIAL: {date_pretrial}\n\tOP_ID: {op_id}\n\maturity_date: {maturity_date}\n\temployee: {employee}')


def add_law(op_id, submission_date, decision_date, decision, orgname, employee):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute('begin op.add_law(:op_id, :submission_date, :decision_date, :decision, :orgname, :employee); end;', 
                               op_id=op_id, submission_date=submission_date, 
                               decision_date=decision_date, decision=decision, orgname=orgname, employee=employee)
            finally:
                log.info(f'ADD_LAW\n\tOP_ID: {op_id}\n\tSUBMISSION_DATE: {submission_date}\n\DECISION_DATE: {decision_date}\n\tDECISION: {decision}\n\tORGNAME: {orgname}\n\temployee: {employee}')