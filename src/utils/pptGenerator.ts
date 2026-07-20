/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pptxgen from 'pptxgenjs';
import { QAReview, QACriterion } from '../types';

/**
 * Generates a highly polished, professional PowerPoint (.pptx) presentation 
 * representing the executive QA Review report for a project.
 */
export async function generateProjectPPTX(review: QAReview, criteria: QACriterion[]) {
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  
  // Official Exed Consulting Branding Colors
  const COLOR_PRIMARY_DARK = '1B365D';  // #1B365D (Deep Navy Blue)
  const COLOR_ACCENT_GOLD = 'C5A059';   // #C5A059 (Warm Gold)
  const COLOR_TEXT_DARK = '334155';     // #334155 (Slate Dark Gray)
  const COLOR_TEXT_LIGHT = 'FFFFFF';    // White
  const COLOR_BG_LIGHT = 'F8FAFC';      // Very Light Slate Gray
  const COLOR_BORDER = 'E2E8F0';        // Border gray
  
  // Color-coded compliance scores
  const COLOR_SUCCESS = '10B981';       // Emerald Green (>= 95%)
  const COLOR_WARNING = 'F59E0B';       // Amber Yellow (90% - 94%)
  const COLOR_DANGER = 'EF4444';        // Red (< 90%)
  
  const adherenceVal = review.adherence !== undefined ? review.adherence : 0;
  const adherencePct = adherenceVal * 100;
  let adherenceColor = COLOR_SUCCESS;
  if (adherencePct < 90) {
    adherenceColor = COLOR_DANGER;
  } else if (adherencePct < 95) {
    adherenceColor = COLOR_WARNING;
  }

  // Define global font
  const FONT_BODY = 'Arial';
  
  // ==========================================
  // SLIDE 1: COVER PAGE (Capa Executiva)
  // ==========================================
  const slide1 = pptx.addSlide();
  
  // Left half dark background for striking asymmetric cover design
  slide1.addShape('rect', {
    x: 0,
    y: 0,
    w: 4.5,
    h: 5.625,
    fill: { color: COLOR_PRIMARY_DARK }
  });
  
  // Right half light background
  slide1.addShape('rect', {
    x: 4.5,
    y: 0,
    w: 5.5,
    h: 5.625,
    fill: { color: COLOR_BG_LIGHT }
  });

  // Small gold accent line at the center dividing
  slide1.addShape('rect', {
    x: 4.45,
    y: 0,
    w: 0.1,
    h: 5.625,
    fill: { color: COLOR_ACCENT_GOLD }
  });

  // Left Section: Portal Title and Category
  slide1.addText("PORTAL EXED", {
    x: 0.5,
    y: 1.2,
    w: 3.5,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLOR_ACCENT_GOLD,
    fontFace: FONT_BODY
  });
  
  slide1.addText("CONTROLE DE QUALIDADE\nDE ONDAS SAP", {
    x: 0.5,
    y: 1.8,
    w: 3.5,
    h: 1.5,
    fontSize: 28,
    bold: true,
    color: COLOR_TEXT_LIGHT,
    fontFace: FONT_BODY
  });
  
  slide1.addText("Relatório Executivo de Quality Gate", {
    x: 0.5,
    y: 3.6,
    w: 3.5,
    h: 0.4,
    fontSize: 12,
    italic: true,
    color: '94A3B8',
    fontFace: FONT_BODY
  });

  // Right Section: Project Metadata Card
  slide1.addText("DADOS GERAIS DO PROJETO", {
    x: 5.0,
    y: 0.8,
    w: 4.5,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: COLOR_PRIMARY_DARK,
    fontFace: FONT_BODY
  });

  // Table on Cover Page containing Project Metadata
  const metadataRows: any[] = [
    [
      { text: "Cliente:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.client, options: { color: COLOR_PRIMARY_DARK, bold: true } }
    ],
    [
      { text: "Projeto / Onda:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.projectName, options: { color: COLOR_PRIMARY_DARK, bold: true } }
    ],
    [
      { text: "Linha de Serviço:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.line, options: { color: COLOR_TEXT_DARK } }
    ],
    [
      { text: "Fase Atual:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.phase, options: { color: COLOR_TEXT_DARK } }
    ],
    [
      { text: "Gerente do Projeto (GP):", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.manager, options: { color: COLOR_TEXT_DARK } }
    ],
    [
      { text: "Data de Auditoria:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.validationDate || "Pendente", options: { color: COLOR_TEXT_DARK } }
    ],
    [
      { text: "Status da Revisão:", options: { bold: true, color: COLOR_TEXT_DARK } },
      { text: review.status.toUpperCase(), options: { color: COLOR_ACCENT_GOLD, bold: true } }
    ]
  ];

  slide1.addTable(metadataRows, {
    x: 5.0,
    y: 1.3,
    w: 4.5,
    h: 3.2,
    colW: [1.8, 2.7],
    fontSize: 10,
    fontFace: FONT_BODY,
    border: { type: 'solid', pt: 1, color: COLOR_BORDER }
  });

  // Footer on cover
  slide1.addText("CONFIDENCIAL - EXED CONSULTING © " + new Date().getFullYear(), {
    x: 5.0,
    y: 4.9,
    w: 4.5,
    h: 0.3,
    fontSize: 8,
    color: '94A3B8',
    fontFace: FONT_BODY,
    align: 'right'
  });


  // ==========================================
  // SLIDE 2: EXECUTIVE SUMMARY (Resumo de Auditoria)
  // ==========================================
  const slide2 = pptx.addSlide();
  
  // Custom Header Bar
  slide2.addShape('rect', { x: 0, y: 0, w: 10, h: 0.9, fill: { color: COLOR_PRIMARY_DARK } });
  slide2.addShape('rect', { x: 0, y: 0.85, w: 10, h: 0.05, fill: { color: COLOR_ACCENT_GOLD } });
  
  slide2.addText("01. RESUMO EXECUTIVO DE AUDITORIA DE QUALITY GATE", {
    x: 0.5,
    y: 0.25,
    w: 9.0,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLOR_TEXT_LIGHT,
    fontFace: FONT_BODY
  });

  // Left Card: Adherence & Performance Box
  slide2.addShape('roundRect', {
    x: 0.5,
    y: 1.2,
    w: 4.2,
    h: 3.8,
    fill: { color: COLOR_BG_LIGHT },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText("ADERÊNCIA AO GATE", {
    x: 0.8,
    y: 1.4,
    w: 3.6,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY,
    align: 'center'
  });

  slide2.addText(`${adherencePct.toFixed(1)}%`, {
    x: 0.8,
    y: 1.8,
    w: 3.6,
    h: 0.9,
    fontSize: 48,
    bold: true,
    color: adherenceColor,
    fontFace: FONT_BODY,
    align: 'center'
  });

  // Status Badge below percentage
  let adherenceLabel = "CONFORME (Excelente)";
  if (adherencePct < 90) {
    adherenceLabel = "NÃO CONFORME (Atenção)";
  } else if (adherencePct < 95) {
    adherenceLabel = "CONFORME PARCIAL (Ajustes necessários)";
  }

  slide2.addText(adherenceLabel, {
    x: 0.8,
    y: 2.8,
    w: 3.6,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: adherenceColor,
    fontFace: FONT_BODY,
    align: 'center'
  });

  // Quantidade de Pendências
  slide2.addText(`PENDÊNCIAS TÉCNICAS IDENTIFICADAS: ${review.pendencyCount}`, {
    x: 0.8,
    y: 3.3,
    w: 3.6,
    h: 0.4,
    fontSize: 10,
    bold: true,
    color: review.pendencyCount > 0 ? COLOR_DANGER : COLOR_SUCCESS,
    fontFace: FONT_BODY,
    align: 'center'
  });

  const necessityText = review.nextQaRequired === 'Sim' || review.nextQaRequired === true 
    ? "Sim, novo ciclo de QA é obrigatório para validação." 
    : "Não, liberado para próxima etapa.";

  slide2.addText(`Novo QA Necessário? ${necessityText}`, {
    x: 0.8,
    y: 3.9,
    w: 3.6,
    h: 0.6,
    fontSize: 9,
    italic: true,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY,
    align: 'center'
  });


  // Right Card: PMO Observations & Notes Box
  slide2.addShape('roundRect', {
    x: 5.1,
    y: 1.2,
    w: 4.4,
    h: 3.8,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText("PARECER DO PMO & OBSERVAÇÕES", {
    x: 5.4,
    y: 1.4,
    w: 3.8,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_PRIMARY_DARK,
    fontFace: FONT_BODY
  });

  const pmoNotes = review.pmoObservations && review.pmoObservations.trim() !== ""
    ? review.pmoObservations
    : "Nenhuma observação crítica registrada pelo PMO para esta onda. O projeto segue as diretrizes metodológicas padrão de qualidade de entregáveis SAP.";

  slide2.addText(pmoNotes, {
    x: 5.4,
    y: 1.8,
    w: 3.8,
    h: 2.8,
    fontSize: 10,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY,
    align: 'left'
  });


  // ==========================================
  // SLIDE 3: DETAILED COMPLIANCE TABLE (Critérios de Qualidade)
  // ==========================================
  const slide3 = pptx.addSlide();
  
  // Header
  slide3.addShape('rect', { x: 0, y: 0, w: 10, h: 0.9, fill: { color: COLOR_PRIMARY_DARK } });
  slide3.addShape('rect', { x: 0, y: 0.85, w: 10, h: 0.05, fill: { color: COLOR_ACCENT_GOLD } });
  
  slide3.addText("02. DETALHAMENTO DA ADERÊNCIA POR CRITÉRIO DE QUALITY GATE", {
    x: 0.5,
    y: 0.25,
    w: 9.0,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLOR_TEXT_LIGHT,
    fontFace: FONT_BODY
  });

  // Table of Criteria & Scores
  // Let's take up to 8 core criteria to fit cleanly on slide table
  const tableHeaders: any[] = [
    { text: "Nº", options: { bold: true, color: COLOR_TEXT_LIGHT, fill: { color: COLOR_PRIMARY_DARK }, align: 'center' } },
    { text: "Critério de Auditoria de Qualidade", options: { bold: true, color: COLOR_TEXT_LIGHT, fill: { color: COLOR_PRIMARY_DARK } } },
    { text: "Peso", options: { bold: true, color: COLOR_TEXT_LIGHT, fill: { color: COLOR_PRIMARY_DARK }, align: 'center' } },
    { text: "Avaliação / Resposta", options: { bold: true, color: COLOR_TEXT_LIGHT, fill: { color: COLOR_PRIMARY_DARK }, align: 'center' } }
  ];

  const criteriaRows: any[] = [tableHeaders];

  // Map scores
  criteria.forEach(c => {
    // Check if we have a score for this criterion in the review
    const scoreVal = review.scores[c.number.toString()];
    if (scoreVal !== undefined) {
      let formattedScore = scoreVal.toString();
      let scoreColor = COLOR_TEXT_DARK;
      
      // Styling rules for visual distinction
      if (formattedScore === '1' || formattedScore === '100%' || formattedScore === 'Sim' || formattedScore === 'SIM') {
        formattedScore = 'Sim (100%)';
        scoreColor = COLOR_SUCCESS;
      } else if (formattedScore === '0' || formattedScore === '0%' || formattedScore === 'Não' || formattedScore === 'NÃO') {
        formattedScore = 'Não (0%)';
        scoreColor = COLOR_DANGER;
      } else if (formattedScore === '0.5' || formattedScore === '50%' || formattedScore === 'Parcial' || formattedScore === 'PARCIAL') {
        formattedScore = 'Parcial (50%)';
        scoreColor = COLOR_WARNING;
      } else if (formattedScore === 'N/A' || formattedScore === 'NA' || formattedScore === 'n/a') {
        formattedScore = 'N/A';
        scoreColor = '94A3B8';
      } else {
        // Percentage directly
        const numVal = parseFloat(formattedScore);
        if (!isNaN(numVal)) {
          formattedScore = (numVal * 100).toFixed(0) + "%";
          if (numVal >= 0.95) scoreColor = COLOR_SUCCESS;
          else if (numVal >= 0.50) scoreColor = COLOR_WARNING;
          else scoreColor = COLOR_DANGER;
        }
      }

      criteriaRows.push([
        { text: c.number.toString(), options: { align: 'center', color: COLOR_TEXT_DARK } },
        { text: c.text, options: { align: 'left', color: COLOR_TEXT_DARK } },
        { text: `P${c.weight}`, options: { align: 'center', color: '64748B' } },
        { text: formattedScore, options: { align: 'center', color: scoreColor, bold: true } }
      ]);
    }
  });

  // Limit to 9 items on the slide table so it fits beautifully
  const slicedRows = criteriaRows.length > 9 ? criteriaRows.slice(0, 9) : criteriaRows;

  // Add the table
  slide3.addTable(slicedRows, {
    x: 0.5,
    y: 1.2,
    w: 9.0,
    h: 3.8,
    colW: [0.6, 5.2, 0.8, 2.4],
    fontSize: 9,
    fontFace: FONT_BODY,
    border: { type: 'solid', pt: 1, color: COLOR_BORDER }
  });

  if (criteriaRows.length > 9) {
    slide3.addText(`* Mostrando os 8 critérios principais de auditoria avaliados.`, {
      x: 0.5,
      y: 5.15,
      w: 9.0,
      h: 0.3,
      fontSize: 8,
      italic: true,
      color: '94A3B8',
      fontFace: FONT_BODY
    });
  }


  // ==========================================
  // SLIDE 4: ACTION PLAN & NEXT GATES
  // ==========================================
  const slide4 = pptx.addSlide();
  
  // Header
  slide4.addShape('rect', { x: 0, y: 0, w: 10, h: 0.9, fill: { color: COLOR_PRIMARY_DARK } });
  slide4.addShape('rect', { x: 0, y: 0.85, w: 10, h: 0.05, fill: { color: COLOR_ACCENT_GOLD } });
  
  slide4.addText("03. PLANO DE AÇÃO E PRÓXIMOS PASSOS (MELHORIA CONTÍNUA)", {
    x: 0.5,
    y: 0.25,
    w: 9.0,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLOR_TEXT_LIGHT,
    fontFace: FONT_BODY
  });

  // Box 1: Tratativa de Desvios (Tratar Pendências)
  slide4.addShape('roundRect', {
    x: 0.5,
    y: 1.2,
    w: 4.3,
    h: 3.8,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide4.addText("AÇÕES CORRETIVAS RECOMENDADAS", {
    x: 0.8,
    y: 1.4,
    w: 3.7,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_PRIMARY_DARK,
    fontFace: FONT_BODY
  });

  const actionsText = review.pendencyCount > 0
    ? `1. Mapear e revisar as ${review.pendencyCount} pendências apontadas nos critérios com nota parcial ou não atendida.\n\n2. Realizar força-tarefa liderada pelo GP ${review.manager} para anexação de evidências e complementação de assinaturas pendentes.\n\n3. Agendar o re-trabalho e alinhar com o cliente ${review.client} a mitigação dos riscos mapeados.`
    : "1. Manter o excelente nível de organização e conformidade metodológica apresentado.\n\n2. Realizar arquivamento das evidências de Quality Gate no repositório oficial do Sharepoint do PMO.\n\n3. Compartilhar boas práticas adotadas com as demais frentes e linhas de projeto EXED.";

  slide4.addText(actionsText, {
    x: 0.8,
    y: 1.9,
    w: 3.7,
    h: 2.8,
    fontSize: 10,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY
  });


  // Box 2: Próximo Gate de Qualidade
  slide4.addShape('roundRect', {
    x: 5.2,
    y: 1.2,
    w: 4.3,
    h: 3.8,
    fill: { color: COLOR_BG_LIGHT },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide4.addText("CRONOGRAMA DO PRÓXIMO QUALITY GATE", {
    x: 5.5,
    y: 1.4,
    w: 3.7,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_PRIMARY_DARK,
    fontFace: FONT_BODY
  });

  slide4.addText("Auditor Responsável: Equipe de PMO EXED", {
    x: 5.5,
    y: 1.9,
    w: 3.7,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY
  });

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30); // 30 days from now
  const formattedTargetDate = targetDate.toLocaleDateString('pt-BR');

  slide4.addText(`Próxima Avaliação Prevista: ~ ${formattedTargetDate}\n\nFase Alvo: Próximo Milestone / Go-Live Preparations\n\nDiretrizes:\nTodos os artefatos de homologação (UAT) devem possuir evidências de aprovação formal (e-mail ou assinatura no ALM) antes da convocação deste novo painel.`, {
    x: 5.5,
    y: 2.3,
    w: 3.7,
    h: 2.3,
    fontSize: 10,
    color: COLOR_TEXT_DARK,
    fontFace: FONT_BODY
  });

  // Trigger browser download of the PPTX file
  const fileName = `Relatorio_QA_${review.client.replace(/\s+/g, '_')}_${review.projectName.replace(/\s+/g, '_')}.pptx`;
  await pptx.writeFile({ fileName });
}
