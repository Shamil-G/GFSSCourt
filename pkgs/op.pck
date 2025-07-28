create or replace package op is

  -- Author  : ГУСЕЙНОВ_Ш
  -- Created : 02.07.2025 17:04:41
  -- Purpose : Работы с переплатами
  
 procedure add_op(i_region in varchar2, i_iin in varchar2, i_rfpm_id in varchar2, 
           i_estimated_damage_amount in number, i_last_status in varchar2);
           
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
                    i_decision in varchar2,
                    i_orgname in varchar2,
                    i_employee in varchar2);

 procedure add_crime_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_verdict_date in varchar2, 
                    i_compensated_amount in varchar2,
                    i_solution_crime_part in varchar2,
                    i_solution_civ_part in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2);

 procedure add_civ_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_solution_date in varchar2, 
                    i_num_solution in varchar2,
                    i_solution in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2);
                    
 procedure add_appeal( i_op_id in number, 
                    i_appeal_date in varchar2, 
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

 procedure add_refunding( i_op_id in number, 
                          i_iin in varchar2,
                          i_mhmh_id in number, 
                          i_pmdl_n in number, 
                          i_pay_date in date,
                          i_sum_pay in number
                        );
                    
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
  
 procedure add_op(i_region in varchar2, i_iin in varchar2, i_rfpm_id in varchar2, 
           i_estimated_damage_amount in number, i_last_status in varchar2)
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

   if i_rfpm_id is null then
      log('add_op', 'RFPM_ID is NULL');
      return;
   end if;

   if i_estimated_damage_amount is null then
      log('add_op', 'ESTIMATED_DAMAGE_AMOUNT is NULL');
      return;
   end if;
   
   if i_last_status is null then
      log('add_op', 'LAST_STATUS is NULL');
      return;
   end if;

   v_exist := exist_person(i_iin);
   if v_exist = 1 then
     insert into overpayments (estimated_damage_amount, compensated_amount, court_damage_amount, iin, 
                 rfpm_id, last_status, region, verdict_date, last_source_solution, last_solution)
     values    ( i_estimated_damage_amount, 0, 0, 
               i_iin, i_rfpm_id, i_last_status, i_region, '', '', '');
     commit;
     return;
   end if;
   
   log('add_op', 'IIN not found: '||i_iin);
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
     insert into scammers (op_id, iin, scammer_org_name, employee)
     values    (i_op_id, i_iin, i_scammer_org_name, i_employee);
     commit;
   end if;
 end add_scammer;

 procedure add_law( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_decision_date in varchar2, 
                    i_decision in varchar2,
                    i_orgname in varchar2,
                    i_employee in varchar2)
 is
 begin
   -- При первом обращении в ПО даты решения еще нет
   if i_decision_date is null
     then
     insert into law_decisions (op_id, submission_date, org_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), i_orgname, i_employee);

     update overpayments t 
     set t.last_status='Обращение в ПО'
     where t.op_id=i_op_id;
   end if;
   
   -- Вводим "задним" числом дату обращения и дату решения
   -- Или делаем корректировку
   if i_decision_date is not null and i_submission_date is not null
     then
       begin
         insert into law_decisions (op_id, submission_date, decision_date, decision, org_name, employee)
         values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_decision_date,'YYYY-MM-DD'), 
                   i_decision, i_orgname, i_employee);
         exception when dup_val_on_index then
             log('ADD_LAW', '1. IDECISION: '||i_decision||', ORGNAME: '||i_orgname);
             update law_decisions ld
             set    ld.decision=case when i_decision is not null then i_decision else ld.decision end,
                    ld.employee=i_employee,
                    ld.org_name=case when i_orgname is not null then i_orgname else ld.org_name end
             where  ld.op_id=i_op_id
             and    ld.submission_date=to_date(i_submission_date,'YYYY-MM-DD');
       end;     
       
       update overpayments t 
       set t.last_status='Обращение в ПО',
           t.verdict_date=to_date(i_decision_date,'YYYY-MM-DD'),
           t.last_source_solution=case when i_orgname is not null then i_orgname else t.last_source_solution end,
           t.last_solution=case when i_decision is not null then i_decision else t.last_solution end
       where t.op_id=i_op_id;

       commit;
       log('ADD_LAW', '2. IDECISION: '||i_decision||', ORGNAME: '||i_orgname);
   end if;

   commit;
 end add_law;

 procedure add_crime_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_verdict_date in varchar2, 
                    i_compensated_amount in varchar2,
                    i_solution_crime_part in varchar2,
                    i_solution_civ_part in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2)
 is
 begin
   -- При первом обращении в ПО даты решения еще нет
   if i_verdict_date is null
     then
     insert into civ_court (op_id, submission_date, court_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), i_court_name, i_employee);

     update overpayments t 
     set t.last_status='Обращение в уголовный суд'
     where t.op_id=i_op_id;
   end if;
      
   -- Вводим "задним" числом дату обращения и дату решения
   --  Или делаем корректировку
   if i_submission_date is not null and i_verdict_date is not null
     then
       begin
         insert into crime_court (op_id, submission_date, verdict_date, compensated_amount, solution_crime_part, solution_civ_part, court_name, employee)
         values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_verdict_date,'YYYY-MM-DD'), 
                    i_compensated_amount, i_solution_crime_part, i_solution_civ_part, i_court_name, i_employee);
       exception when dup_val_on_index then
         update crime_court cc
         set cc.verdict_date=to_date(i_verdict_date,'YYYY-MM-DD'),
             cc.compensated_amount=i_compensated_amount,
             cc.solution_crime_part=case when i_solution_crime_part is not null then i_solution_crime_part else cc.solution_crime_part end,
             cc.solution_civ_part=case when i_solution_civ_part is not null then i_solution_civ_part else cc.solution_civ_part end,
             cc.court_name=case when i_court_name is not null then i_court_name else cc.court_name end,
             cc.employee=i_employee
         where cc.op_id=i_op_id and cc.submission_date=i_submission_date;
       end;
                 
       update overpayments t 
       set t.last_status='Обращение в уголовный суд',
           t.verdict_date=to_date(i_verdict_date,'YYYY-MM-DD'),
           t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
           t.last_solution=i_solution_crime_part||' : '||i_solution_civ_part
       where t.op_id=i_op_id;
   end if;

   commit;
 end add_crime_court;
 
 procedure add_civ_court( i_op_id in number, 
                    i_submission_date in varchar2, 
                    i_solution_date in varchar2, 
                    i_num_solution in varchar2,
                    i_solution in varchar2,
                    i_court_name in varchar2,
                    i_employee in varchar2)
 is
 begin
   -- При первом обращении в ПО даты решения еще нет
   if i_solution_date is null
     then
     insert into civ_court (op_id, submission_date, court_name, employee)
     values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), i_court_name, i_employee);

     update overpayments t 
     set t.last_status='Обращение в гражданский суд'
     where t.op_id=i_op_id;
   end if;

   -- Вводим "задним" числом дату обращения и дату решения
   -- либо делаем корректировку уже введенных данных
   if i_solution_date is not null and i_submission_date is not null
     then
       begin
         insert into civ_court (op_id, submission_date, solution_date, num_solution, solution, court_name, employee)
         values    (i_op_id, to_date(i_submission_date,'YYYY-MM-DD'), to_date(i_solution_date,'YYYY-MM-DD'), 
                    i_num_solution, i_solution, i_court_name, i_employee);
       exception when dup_val_on_index then
         update civ_court cc
         set    cc.solution_date=to_date(i_solution_date,'YYYY-MM-DD'),
                cc.num_solution=case when i_num_solution is not null then i_num_solution else cc.num_solution end,
                cc.solution=case when i_solution is not null then i_solution else cc.solution end,
                cc.court_name=case when i_court_name is not null then i_court_name else cc.court_name end,
                cc.employee=i_employee
         where cc.op_id=i_op_id and cc.submission_date=i_submission_date;
       end;
              
       update overpayments t 
       set t.last_status='Обращение в гражданский суд',
           t.verdict_date=to_date(i_solution_date,'YYYY-MM-DD'),
           t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
           t.last_solution=case when i_solution is not null then i_solution else t.last_solution end
       where t.op_id=i_op_id;
   end if;

   commit;
 end add_civ_court;

 procedure add_appeal( i_op_id in number, 
                    i_appeal_date in varchar2, 
                    i_appeal_solution in varchar2, 
                    i_cassation_appeal_solution in varchar2, 
                    i_court_name in varchar2, 
                    i_employee in varchar2)
 is
 begin
   -- При первом обращении в ПО кассации еще нет
   if i_cassation_appeal_solution is null
     then
     insert into civ_court (op_id, submission_date, court_name, employee)
     values    (i_op_id, to_date(i_appeal_date,'YYYY-MM-DD'), i_court_name, i_employee);

     update overpayments t 
     set t.last_status='Обращение в аппеляционный суд',
           t.last_source_solution=i_court_name,
           t.last_solution=i_appeal_solution
     where t.op_id=i_op_id;
   end if;
   
   -- Вводим "задним" числом дату аппеляции и кассационное решение
   -- Или делаем корреткировку
   if i_appeal_date is not null and i_cassation_appeal_solution is not null
     then
       begin
         insert into appeal_court (op_id, appeal_date, appeal_solution, cassation_appeal_solution, court_name, employee)
         values    (i_op_id, to_date(i_appeal_date,'YYYY-MM-DD'), i_appeal_solution, i_cassation_appeal_solution, 
                    i_court_name, i_employee);
       exception when dup_val_on_index then
         update appeal_court cc
         set    cc.appeal_solution=i_appeal_solution,
                cc.cassation_appeal_solution=i_cassation_appeal_solution,
                cc.court_name=i_court_name,
                cc.employee=i_employee
         where  cc.op_id=i_op_id
         and    cc.appeal_date=i_appeal_date;         
       end;
                 
       update overpayments t 
       set t.last_status='Обращение в аппеляционный суд',
           t.verdict_date=to_date(i_appeal_date,'YYYY-MM-DD'),
           t.last_source_solution=case when i_court_name is not null then i_court_name else t.last_source_solution end,
           t.last_solution=case when i_cassation_appeal_solution is not null then i_cassation_appeal_solution
                                when i_appeal_solution is not null then i_appeal_solution
                                else t.last_solution
                           end
       where t.op_id=i_op_id;
   end if;

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
   r_row executions%rowtype;
 begin

   -- При первом обращении в ПО даты кассации еще нет
   if i_start_date is null
     then
     insert into executions (op_id, transfer_date, employee)
     values    (i_op_id, to_date(i_transfer_date,'YYYY-MM-DD'), i_employee);

     update overpayments t 
     set t.last_status='Передано на исполнение',
           t.last_source_solution=i_court_executor
     where t.op_id=i_op_id;
   end if;
   
   -- Вводим "задним" числом дату обращения и дату начала исполнения
   -- Или делаем корректировку
   if i_transfer_date is not null and i_start_date is not null
     then
        begin
          insert into executions( op_id, transfer_date, start_date, phone, court_executor, employee )
          values (
                    i_op_id, 
                    to_date(i_transfer_date,'YYYY-MM-DD'), 
                    to_date(i_start_date,'YYYY-MM-DD'), 
                    i_phone,
                    i_court_executor, i_employee
          );   
        exception when dup_val_on_index then
           update executions e
           set    e.start_date=to_date(i_start_date,'YYYY-MM-DD'),
                  e.phone=i_phone,
                  e.court_executor=i_court_executor,
                  e.employee=i_employee
           where  e.op_id=i_op_id
           and    e.transfer_date=r_row.transfer_date;
        end;   
        
       update overpayments t 
       set t.last_status='Передано на исполнение',
           t.verdict_date=to_date(i_start_date,'YYYY-MM-DD'),
           t.last_source_solution=i_court_executor
       where t.op_id=i_op_id;
   end if;

  commit;
 end add_execution;

 procedure add_refunding( i_op_id in number, 
                          i_iin in varchar2,
                          i_mhmh_id in number, 
                          i_pmdl_n in number, 
                          i_pay_date in date,
                          i_sum_pay in number
                        )
 is
 begin

   insert into refunding (op_id, iin, mhmh_id, pmdl_n, pay_date, sum_pay)
   values    (i_op_id, i_iin, i_mhmh_id, i_pmdl_n, i_pay_date, i_sum_pay);

   commit;
 end add_refunding;

begin
  null;
end op;
/
