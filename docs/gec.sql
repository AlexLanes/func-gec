/*
  DESCRIBE GEC.ISRH_CONTROLE_INTEGRACAO
  
  SELECT ISCI_CD_CONTROLE_INTEGRACAO, ISCI_NM_TABELA_INTEGRACAO, ISCI_DS_TABELA_INTEGRACAO, ISCI_DF_CASO_MOAG, ISCI_QN_TOTAL_REGISTROS, ISCI_DS_SITUACAO_REGISTRO, ISCI_TX_MENSAGEM_ERRO, ISCI_DF_CRIACAO_REGISTRO, ISCI_DF_ATUALIZACAO_REGISTRO, ISCI_TX_RESPONSAVEL_ATUALIZACA
  FROM GEC.ISRH_CONTROLE_INTEGRACAO
  WHERE ISCI_CD_CONTROLE_INTEGRACAO = 'c2de8ee61bf1b910435e0d8ce54bcb12'      
  
  DELETE FROM GEC.ISRH_CONTROLE_INTEGRACAO
  WHERE ISCI_CD_CONTROLE_INTEGRACAO = 'c2de8ee61bf1b910435e0d8ce54bcb12'
  
  MERGE INTO GEC.ISRH_CONTROLE_INTEGRACAO
  USING (SELECT 1 FROM DUAL) 
    ON (ISCI_CD_CONTROLE_INTEGRACAO = 'c2de8ee61bf1b910435e0d8ce54bcb12') 
  WHEN NOT MATCHED THEN 
    INSERT (ISCI_CD_CONTROLE_INTEGRACAO, ISCI_NM_TABELA_INTEGRACAO, ISCI_DS_TABELA_INTEGRACAO, ISCI_DF_CASO_MOAG, ISCI_QN_TOTAL_REGISTROS, ISCI_DS_SITUACAO_REGISTRO, ISCI_TX_MENSAGEM_ERRO, ISCI_DF_CRIACAO_REGISTRO, ISCI_DF_ATUALIZACAO_REGISTRO, ISCI_TX_RESPONSAVEL_ATUALIZACA) 
    VALUES ('c2de8ee61bf1b910435e0d8ce54bcb12', 'x_petro_gas_energy_moagen_maximum_offer', 'Integração Moagem', TO_DATE('11-08-2023 19:07', 'dd-MM-yyyy hh24:mi'), 0, 'processing', 'Solicitação de atualização recebida. Processamento da carga da tabela será iniciado.', TO_DATE('2023-08-11 22:07:56', 'yyyy-MM-dd hh24:mi:ss'), TO_DATE('2023-08-11 22:07:56', 'yyyy-MM-dd hh24:mi:ss'), 'ZBS8') 
  WHEN MATCHED THEN 
    UPDATE SET 
      ISCI_NM_TABELA_INTEGRACAO = 'x_petro_gas_energy_moagen_maximum_offer',
      ISCI_DS_TABELA_INTEGRACAO = 'Integração Moagem',
      ISCI_DF_CASO_MOAG = TO_DATE('11-08-2023 19:07', 'dd-MM-yyyy hh24:mi'),
      ISCI_QN_TOTAL_REGISTROS = 0, 
      ISCI_DS_SITUACAO_REGISTRO = 'error',
      ISCI_TX_MENSAGEM_ERRO = 'id(b6d0bd69-4ec5-4ab8-850b-0805768c54b8) | Falha na consulta dos dados ou na persistência da tabela de oferta.',
      ISCI_DF_CRIACAO_REGISTRO = TO_DATE('2023-08-11 22:07:56', 'yyyy-MM-dd hh24:mi:ss'), 
      ISCI_DF_ATUALIZACAO_REGISTRO = TO_DATE('2023-08-11 22:07:56', 'yyyy-MM-dd hh24:mi:ss'), 
      ISCI_TX_RESPONSAVEL_ATUALIZACA = 'ZBS8'
*/


-- GEC.ISRH_OFERTA_GAS
/*
  DESCRIBE GEC.ISRH_OFERTA_GAS
  
  SELECT count(*) as quantidade
  FROM GEC.ISRH_OFERTA_GAS
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('03-02-2023 16:22', 'dd-MM-yyyy hh24:mi');
  
  DELETE FROM GEC.ISRH_OFERTA_GAS
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('03-02-2023 16:22', 'dd-MM-yyyy hh24:mi');
  
  INSERT INTO GEC.ISRH_OFERTA_GAS (ISCI_DF_CASO_MOAG, ISOG_CD_PONTO_OFERTA_GAS, ISOG_CD_FAIXA_OFERTA_GAS, ISOG_DF_OFERTA_GAS, ISOG_MD_VOLUME_OFERTA_GAS, ISOG_DF_GRAVACAO_REGISTRO)
  VALUES (TO_DATE('03-02-2023 16:22', 'dd-MM-yyyy hh24:mi'), 'Rota 2', 'O_ROTA_2', TO_DATE('2023-03-21', 'yyyy-MM-dd'), 9775, TO_DATE('2023-08-31 11:50:00', 'yyyy-MM-dd hh24:mi:ss'));
*/


-- GEC.ISRH_DEMANDA_GAS
/*
  DESCRIBE GEC.ISRH_DEMANDA_GAS
  
  SELECT count(*)
  FROM GEC.ISRH_DEMANDA_GAS
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('01-11-2021 19:13', 'dd-MM-yyyy hh24:mi');
  
  DELETE FROM GEC.ISRH_DEMANDA_GAS
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('01-11-2021 19:13', 'dd-MM-yyyy hh24:mi');
  
  INSERT INTO GEC.ISRH_DEMANDA_GAS 
    (ISCI_DF_CASO_MOAG, ISDG_CD_COMPANHIA_DISTRIBUICAO, ISDG_CD_PONTO_ENTREGA, ISDG_DF_DEMANDA_GAS, ISDG_MD_VOLUME_DEMANDA, ISDG_DF_GRAVACAO_REGISTRO) 
  VALUES 
    (TO_DATE('01-11-2021 19:13', 'dd-MM-yyyy hh24:mi'), 'ALGAS', 'Penedo', TO_DATE('2023-03-06', 'yyyy-MM-dd'), 14321, TO_DATE('2023-08-31T11:50:00', 'yyyy-MM-dd"T"hh24:mi:ss'))
*/


-- GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT
/*
  DESCRIBE GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT
  
  SELECT count(*)
  FROM GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('22-03-2023 15:09', 'dd-MM-yyyy hh24:mi');
  
  DELETE 
  FROM GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT
  WHERE ISCI_DF_CASO_MOAG = TO_DATE('22-03-2023 15:09', 'dd-MM-yyyy hh24:mi');
  
  INSERT INTO GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT
    (ISCI_DF_CASO_MOAG, BLFI_CD_BLOCO_FISICO_ISRH, PACA_CD_PATAMAR_CARGA_ISRH, IDBP_DF_DISPONIBILIDADE_BLOCO, IDBP_DS_TIPO_REGISTRO, IDBP_PR_DISPONIBILIDADE, IDBP_DF_GRAVACAO_DISPONIBILIDA)
  VALUES
    (TO_DATE('22-03-2023 15:09', 'dd-MM-yyyy hh24:mi'), 'T_Termoceará_2', 'heavy', TO_DATE('2023-03-06', 'yyyy-MM-dd'), 'availability', 100, TO_DATE('2023-08-31T11:50:00', 'yyyy-MM-dd"T"hh24:mi:ss'))
*/