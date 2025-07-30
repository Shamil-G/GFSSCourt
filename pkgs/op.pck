create or replace package op is

  -- Author  : ГУСЕЙНОВ_Ш
  -- Created : 02.07.2025 17:04:41
  -- Purpose : Работы с переплатами
  
 procedure add_op(i_region in varchar2, i_iin in varchar2, i_risk_date in varchar2, i_rfpm_id in varchar2, 
           i_sum_civ_amount in number);
           
 procedure add_pta( i_op_id in number, 
                    i_date_pretrial in varchar2, 
                    i_until_day in number,
                    i_maturity_date in varchar2, 
                    i_employee in varchar2);

 procedure add_scammer( i_op_id in number, 
                    i_iin in varchar2, 
                    i_scammer_org_name in varchar2,
                    i_employee in varchar2);
                    
 procedure add_law( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_decision_date in varchar2, 
                    i_effective_date in varchar2,
                    i_decision in varchar2,
                    i_orgname in varchar2,
                    i_employee in varchar2);

 procedure add_crime_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_verdict_date in varchar2, 
                    i_effective_date in varchar2,
                    i_sum_civ_amount in varchar2,
                    i_compensated_amount in varchar2,
                    i_solution_crime_part in varchar2,
                    i_solution_civ_part in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2);

 procedure add_civ_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_solution_date in varchar2, 
                    i_effective_date in varchar2,
                    i_num_solution in varchar2,
                    i_solution in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2);
                    
 procedure add_appeal( i_op_id in number, 
                    i_appeal_date in varchar2, 
                    i_effective_date in varchar2,
                    i_appeal_solution in varchar2, 
                    i_cassation_appeal_solution in varchar2, 
                    i_court_name in varchar2, 
                    i_employee in varchar2);
                                        
 procedure add_execution( i_op_id in number, 
                          i_transfer_date in varchar2,
                          i_start_date in varchar2, 
                          i_phone in varchar2, 
                          i_court_executor in varchar2, 
                          i_employee in varchar2
                        );                  

 procedure check_refunding(i_op_id in varchar2);
 procedure check_full_refunding; 
 procedure clean;

 
end op;
/
create or replace package body op is

  procedure log(iproc in varchar2, imsg in varchar2)
  is
  pragma autonomous_transaction;
  begin
    insert into log(package, proc, msg) values('OP', iproc, imsg);
    commit;
  end log;
  
  function exist_person(i_iin in varchar2) return pls_integer
  is
    v_result pls_integer default 0;
--     v_result varchar2(128);
  begin
   -- Проверяем существование человека
   select 1 into v_result from loader.person p where p.iin=i_iin;

   return 1;
   exception when no_data_found then return 0;
  end exist_person;
  
 procedure add_op( i_region in varchar2, i_iin in varchar2, i_risk_date in varchar2, i_rfpm_id in varchar2, 
                   i_sum_civ_amount in number)
 is
   v_exist pls_integer default 0;
 begin
   if i_region is null then
      log('add_op', 'REGION is NULL');
      return;
   end if;

   if i_iin is null then
      log('add_op', 'IIN is NULL');
      return;
   end if;

   if i_risk_date is null then
      log('add_op', 'RISK_DATE is NULL');
      return;
   end if;

   if i_sum_civ_amount is null then
      log('add_op', 'SUM_CIV_AMOUNT is NULL');
      return;
   end if;
   
   v_exist := exist_person(i_iin);
   if v_exist = 1 then
     begin
       log('add_op', 'IIN: '||i_iin||', sum_civ_amount: '||i_sum_civ_amount||', risk_date: '||i_risk_date||', rfpm_id: '||i_rfpm_id||', region: '||i_region);
       insert into overpayments (sum_civ_amount, iin, 
                    risk_date, 
                   rfpm_id, region, last_status )
       values    ( i_sum_civ_amount, i_iin, 
                   to_date(i_risk_date,'YYYY-MM-DD'), 
                   i_rfpm_id, i_region, 'Первичный ввод');
     exception when dup_val_on_index then
       update overpayments op
       set    op.sum_civ_amount=case when i_sum_civ_amount is not null then i_sum_civ_amount else op.sum_civ_amount end,
              op.region=case when i_region is not null then i_region else op.region end,
              op.rfpm_id=case when i_rfpm_id is not null then i_rfpm_id else op.rfpm_id end
       where op.iin=i_iin and op.risk_date=to_date(i_risk_date,'YYYY-MM-DD');
       
     end;
     commit;
   end if;
   
 end add_op;
 
  procedure add_pta( i_op_id in number, 
                    i_date_pretrial in varchar2, 
                    i_until_day in number,
                    i_maturity_date in varchar2, 
                    i_employee in varchar2)
 is
 begin
   insert into pt_agreements (op_id, date_pretrial, until_day, maturity_date, employee)
   values    (i_op_id, to_date(i_date_pretrial,'YYYY-MM-DD'), i_until_day, to_date(i_maturity_date,'YYYY-MM-DD'), i_employee);

   update overpayments t 
   set t.last_status='Досудебное соглашение' 
   where t.op_id=i_op_id;
   commit;

   exception when dup_val_on_index then
     log('ADD_PTA', 'DUP_VAL_ON_INDEX. OP_ID: '||i_op_id||', date_pretrial: '||to_date(i_date_pretrial,'YYYY-MM-DD'));
     update pt_agreements pt
     set    pt.until_day=i_until_day,
            pt.maturity_date=to_date(i_maturity_date,'YYYY-MM-DD')
     where pt.op_id=i_op_id and pt.date_pretrial=to_date(i_date_pretrial,'YYYY-MM-DD');
     commit;
 end add_pta;

 procedure add_scammer( i_op_id in number, 
                    i_iin in varchar2, 
                    i_scammer_org_name in varchar2,
                    i_employee in varchar2)
 is
   v_exist pls_integer default 0;
 begin
   v_exist := exist_person(i_iin);
   
   if v_exist=1 then
     begin
     insert into scammers (op_id, iin, scammer_org_name, employee)
     values    (i_op_id, i_iin, i_scammer_org_name, i_employee);
     commit;
     end;
   end if;
   exception when dup_val_on_index then
     update scammers sc
     set    sc.scammer_org_name=case when i_scammer_org_name is not null then i_scammer_org_name else sc.scammer_org_name end,
            sc.employee=i_employee
     where  sc.op_id=i_op_id and sc.iin=i_iin;
     commit;
 end add_scammer;

 procedure add_law( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_decision_date in varchar2, 
                    i_effective_date in varchar2,
                    i_decision in varchar2,
                    i_orgname in varchar2,
                    i_employee in varchar2)
 is
 begin
   begin
     insert into law_decisions (op_id, submission_date, decision_date, effective_date, decision, org_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_decision_date,'YYYY-MM-DD'), 
               to_date(i_effective_date,'YYYY-MM-DD'), 
               i_decision, i_orgname, i_employee);
   exception when dup_val_on_index then
       log('ADD_LAW', '1. IDECISION: '||i_decision||', ORGNAME: '||i_orgname);
       update law_decisions ld
       set    ld.decision=case when i_decision is not null then i_decision else ld.decision end,
              ld.decision_date=case when i_decision_date is not null then to_date(i_decision_date,'YYYY-MM-DD') else ld.decision_date end,
              ld.effective_date=case when i_effective_date is not null then to_date(i_effective_date,'YYYY-MM-DD') else ld.effective_date end,
              ld.employee=i_employee,
              ld.org_name=case when i_orgname is not null then i_orgname else ld.org_name end
       where  ld.op_id=i_op_id
       and    ld.submission_date=to_date(i_submission_date,'YYYY-MM-DD');
   end;     
       

   update overpayments t 
   set t.last_status='Обращение в ПО',
       t.verdict_date=case when i_decision_date is not null
                                and to_date(i_decision_date,'YYYY-MM-DD')>coalesce(t.verdict_date, to_date('01.01.1900','dd.mm.yyyy')) 
                           then to_date(i_decision_date,'YYYY-MM-DD') 
                           else t.verdict_date 
                      end,
       t.effective_date=case when i_effective_date is not null 
                                  and to_date(i_effective_date,'YYYY-MM-DD')>coalesce(t.effective_date, to_date('01.01.1900','dd.mm.yyyy')) 
                             then to_date(i_effective_date,'YYYY-MM-DD') 
                             else t.effective_date 
                        end,
       t.last_source_solution=case when i_orgname is not null then i_orgname else t.last_source_solution end,
       t.last_solution=case when i_decision is not null then i_decision else t.last_solution end
   where t.op_id=i_op_id;
   commit;
 end add_law;

 procedure add_crime_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_verdict_date in varchar2, 
                    i_effective_date in varchar2,
                    i_sum_civ_amount in varchar2,
                    i_compensated_amount in varchar2,
                    i_solution_crime_part in varchar2,
                    i_solution_civ_part in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2)
 is
 begin
   begin
     insert into crime_court (op_id, submission_date, verdict_date, effective_date, sum_civ_amount, 
                              compensated_amount, solution_crime_part, solution_civ_part, court_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_verdict_date,'YYYY-MM-DD'), 
                to_date(i_effective_date,'YYYY-MM-DD'), i_sum_civ_amount,
                i_compensated_amount, i_solution_crime_part, i_solution_civ_part, i_court_name, i_employee);
   exception when dup_val_on_index then
     log('ADD CRIME COURT', 'OP_ID: '||i_op_id||', i_sum_civ_amount: '||i_sum_civ_amount);
     update crime_court cc
     set cc.verdict_date=case when i_verdict_date is not null then to_date(i_verdict_date,'YYYY-MM-DD') else cc.verdict_date end,
         cc.effective_date=case when i_effective_date is not null then to_date(i_effective_date,'YYYY-MM-DD') else cc.effective_date end,
         cc.sum_civ_amount=case when i_sum_civ_amount is not null then to_number(i_sum_civ_amount) else cc.sum_civ_amount end,
         cc.compensated_amount=case when i_compensated_amount is not null then to_number(i_compensated_amount) else cc.compensated_amount end,
         cc.solution_crime_part=case when i_solution_crime_part is not null then i_solution_crime_part else cc.solution_crime_part end,
         cc.solution_civ_part=case when i_solution_civ_part is not null then i_solution_civ_part else cc.solution_civ_part end,
         cc.court_name=case when i_court_name is not null then i_court_name else cc.court_name end,
         cc.employee=i_employee
     where cc.op_id=i_op_id and cc.submission_date=to_date(i_submission_date,'YYYY-MM-DD');
   end;
                 
   update overpayments t 
   set t.last_status='Обращение в уголовный суд',
       t.verdict_date=case when i_verdict_date is not null and to_date(i_verdict_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_verdict_date,'YYYY-MM-DD')
                           when i_submission_date is not null and to_date(i_submission_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_submission_date,'YYYY-MM-DD')
                           else t.verdict_date
                      end,
       t.effective_date=case when i_effective_date is not null 
                                  and to_date(i_effective_date,'YYYY-MM-DD')>coalesce(t.effective_date, to_date('01.01.1900','dd.mm.yyyy')) 
                             then to_date(i_effective_date,'YYYY-MM-DD') 
                             else t.effective_date 
                        end,                      
       t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
       t.last_solution=case when i_solution_crime_part is not null and i_solution_civ_part is not null
                            then i_solution_crime_part||' : '||i_solution_civ_part
                            else t.last_solution
                       end
   where t.op_id=i_op_id;

   commit;
 end add_crime_court;
 
 procedure add_civ_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_solution_date in varchar2, 
                    i_effective_date in varchar2,
                    i_num_solution in varchar2,
                    i_solution in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2)
 is
 begin
   begin
     insert into civ_court (op_id, submission_date, solution_date, effective_date, num_solution, solution, court_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_solution_date,'YYYY-MM-DD'), 
                to_date(i_effective_date,'YYYY-MM-DD'), 
                i_num_solution, i_solution, i_court_name, i_employee);
   exception when dup_val_on_index then
     update civ_court cc
     set    cc.solution_date=case when i_solution_date is not null then to_date(i_solution_date,'YYYY-MM-DD') else cc.solution_date end,
            cc.effective_date=case when i_effective_date is not null then to_date(i_effective_date,'YYYY-MM-DD') else cc.effective_date end,
            cc.num_solution=case when i_num_solution is not null then i_num_solution else cc.num_solution end,
            cc.solution=case when i_solution is not null then i_solution else cc.solution end,
            cc.court_name=case when i_court_name is not null then i_court_name else cc.court_name end,
            cc.employee=i_employee
     where cc.op_id=i_op_id and cc.submission_date=to_date(i_submission_date,'YYYY-MM-DD');
   end;
              
   update overpayments t 
   set t.last_status='Обращение в гражданский суд',
       t.verdict_date=case when i_solution_date is not null and to_date(i_solution_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_solution_date,'YYYY-MM-DD')
                           when i_submission_date is not null and to_date(i_submission_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_submission_date,'YYYY-MM-DD')
                           else t.verdict_date 
                      end,
       t.effective_date=case when i_effective_date is not null and to_date(i_effective_date,'YYYY-MM-DD')>t.effective_date then to_date(i_effective_date,'YYYY-MM-DD')
                             else t.effective_date 
                        end,
       t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
       t.last_solution=case when i_solution is not null then i_solution else t.last_solution end
   where t.op_id=i_op_id;

   commit;
 end add_civ_court;

 procedure add_appeal( i_op_id in number, 
                    i_appeal_date in varchar2, 
                    i_effective_date in varchar2,
                    i_appeal_solution in varchar2, 
                    i_cassation_appeal_solution in varchar2, 
                    i_court_name in varchar2, 
                    i_employee in varchar2)
 is
 begin
   begin
     insert into appeal_court (op_id, appeal_date, effective_date, appeal_solution, cassation_appeal_solution, court_name, employee)
     values    (i_op_id, to_date(i_appeal_date,'YYYY-MM-DD'), to_date(i_effective_date,'YYYY-MM-DD'),
                i_appeal_solution, i_cassation_appeal_solution, 
                i_court_name, i_employee);
   exception when dup_val_on_index then
     update appeal_court cc
     set    cc.appeal_solution=case when i_appeal_solution is not null then i_appeal_solution else cc.appeal_solution end,
            cc.effective_date=case when i_effective_date is not null then to_date(i_effective_date,'YYYY-MM-DD') else cc.effective_date end,     
            cc.cassation_appeal_solution=case when i_cassation_appeal_solution is not null then i_cassation_appeal_solution else cc.cassation_appeal_solution end,
            cc.court_name=i_court_name,
            cc.employee=i_employee
     where  cc.op_id=i_op_id
     and    cc.appeal_date=to_date(i_appeal_date,'YYYY-MM-DD');         
   end;
                 
   update overpayments t 
   set t.last_status='Обращение в аппеляционный суд',
       t.verdict_date=case 
                           when i_appeal_date is not null and to_date(i_appeal_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_appeal_date,'YYYY-MM-DD')
                           else t.verdict_date
                      end,
       t.effective_date=case when i_effective_date is not null and to_date(i_effective_date,'YYYY-MM-DD')>t.effective_date then to_date(i_effective_date,'YYYY-MM-DD')
                             else t.effective_date 
                        end,
       t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
       t.last_solution=case when i_cassation_appeal_solution is not null then i_cassation_appeal_solution
                            when i_appeal_solution is not null then i_appeal_solution
                            else t.last_solution
                       end
   where t.op_id=i_op_id;

   commit;
 end add_appeal;
 
 procedure add_execution( i_op_id in number, 
                          i_transfer_date in varchar2,
                          i_start_date in varchar2, 
                          i_phone in varchar2, 
                          i_court_executor in varchar2, 
                          i_employee in varchar2
                        )
 is
 begin
   begin
      insert into executions( op_id, transfer_date, start_date, phone, court_executor, employee )
      values (
                i_op_id, 
                to_date(i_transfer_date,'YYYY-MM-DD'), 
                to_date(i_start_date,'YYYY-MM-DD'), 
                i_phone,
                i_court_executor, 
                i_employee
      );   
      log('ADD EXECUTION', 'OP_ID: '||i_op_id||', TRANSFER_DATE: '||i_transfer_date||', START_DATE: '||
                i_start_date||', PHONE: '||i_phone||', COURT_EXECUTOR: '||i_court_executor);
   exception when dup_val_on_index then
       log('UPD EXECUTION', 'OP_ID: '||i_op_id||', TRANSFER_DATE: '||i_transfer_date||', START_DATE: '||
                i_start_date||', PHONE: '||i_phone||', COURT_EXECUTOR: '||i_court_executor);
       update executions e
       set    e.start_date=case when i_start_date is not null then to_date(i_start_date,'YYYY-MM-DD') else e.start_date end,
              e.phone=case when i_phone is not null then i_phone else e.phone end,
              e.court_executor=case when i_court_executor is not null then i_court_executor else e.court_executor end,
              e.employee=i_employee
       where  e.op_id=i_op_id
       and    e.transfer_date=to_date(i_transfer_date,'YYYY-MM-DD');
       commit;
   end;   

   update overpayments t 
   set t.last_status='Передано на исполнение',
       t.verdict_date=case 
                           when i_transfer_date is not null and to_date(i_transfer_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_transfer_date,'YYYY-MM-DD')
                           when i_start_date is not null and to_date(i_start_date,'YYYY-MM-DD')>t.verdict_date then to_date(i_start_date,'YYYY-MM-DD')
                           else t.verdict_date
                      end
   where t.op_id=i_op_id;
       
   commit;
 end add_execution;

 procedure check_refunding(i_op_id in varchar2)
 is
  v_sum_refunding number(19,2);
 begin
   log('CHECK REFUNDING', 'OP_ID: '||i_op_id);
   for cur in (select * from overpayments op where op.op_id=i_op_id and op.sum_civ_amount>coalesce(op.compensated_amount, 0))
   loop
      v_sum_refunding:=0;
      for cur_pay in (
          select dl.pay_sum, pd.mhmh_id, dl.pmdl_n, pd.pay_date
          from  loader.pmpd_pay_doc pd, loader.pmdl_doc_list_s dl, loader.person p
          where pd.mhmh_id=dl.mhmh_id
          and   pd.pay_date=dl.pay_date
--           and   pd.pay_date>cur.op_date
          and   pd.cipher_id_knp=get_refund_knp(cur.rfpm_id)
          and   pd.r_account= 'KZ70125KZT1001300134'
          and   dl.sicid=p.sicid
          and   p.iin=cur.iin
      )
      loop
        v_sum_refunding:=v_sum_refunding+cur_pay.pay_sum;
        begin
          log('CHECK REFUNDING', 'ADD. OP_ID: '||i_op_id||', SUM_PAY: '||cur_pay.pay_sum);
          insert into refunding (op_id, iin, mhmh_id, pmdl_n, pay_date, sum_pay)
          values    (cur.op_id, cur.iin, cur_pay.mhmh_id, cur_pay.pmdl_n, cur_pay.pay_date, cur_pay.pay_sum);
        exception when dup_val_on_index then null;
        end;
        update overpayments op
        set    op.compensated_amount=v_sum_refunding
        where  op.op_id=cur.op_id
        and    op.iin=cur.iin;
      end loop;
   end loop;
   commit;
 end check_refunding;


 procedure check_full_refunding
 is
 begin
   for cur in (select * from overpayments op where op.sum_civ_amount>op.compensated_amount)
   loop
     check_refunding(cur.op_id);
   end loop;
 end check_full_refunding;
 
 procedure clean
 is
 begin
   execute immediate 'truncate table overpayments';
   execute immediate 'truncate table refunding ';
   execute immediate 'truncate table pt_agreements';
   execute immediate 'truncate table law_decisions';   
   execute immediate 'truncate table executions';   
   execute immediate 'truncate table crime_court';   
   execute immediate 'truncate table civ_court';   
   execute immediate 'truncate table civ_court';   
   execute immediate 'truncate table appeal_court';   
 end clean; 
 
begin
  null;
end op;
/
