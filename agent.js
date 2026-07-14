document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const agentIntro = document.getElementById('agent-intro');
  const agentConsole = document.getElementById('agent-console');
  const consoleLogs = document.getElementById('console-logs');
  const consoleSpinner = document.getElementById('console-spinner');
  const agentReport = document.getElementById('agent-report');
  const reportContent = document.getElementById('report-content');
  const reportTitle = document.getElementById('report-title');
  const btnBackAgent = document.getElementById('btn-back-agent');
  
  // Quick buttons
  const quickBtns = document.querySelectorAll('.quick-btn');

  // Event Listeners
  btnBackAgent.addEventListener('click', resetAgentPanel);
  
  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent row click events
      const oemId = btn.dataset.oem;
      triggerAgentQuery(oemId);
    });
  });

  // Main Sourcing Agent Query Function (Client-Side Simulation)
  async function triggerAgentQuery(oemId) {
    if (!window.AppController) return;
    const oem = window.AppController.getOem(oemId);
    if (!oem) return;

    // Hide intro, show console
    agentIntro.style.display = 'none';
    agentReport.style.display = 'none';
    agentConsole.style.display = 'flex';
    consoleSpinner.style.display = 'flex';
    consoleLogs.innerHTML = '';

    // Generate dynamic logs based on OEM properties
    const logs = [
      { status: 'info', msg: `Initializing MiniMines Intelligence Agent for [${oem.name}]...` },
      { status: 'search', msg: `Searching Central Pollution Control Board (CPCB) Central Centralised Portal...` },
      { status: 'success', msg: `Found active EPR registration: ${oem.cpcb_status}. Status is currently verified.` },
      { status: 'search', msg: `Scanning custom import logs for HSN 85076000 (Lithium-Ion Cells)...` },
      { status: 'info', msg: `Analyzed cell chemistry profile: ${oem.chemistry}. Current imports tracked: ${oem.imports_2025} Tons.` },
      { status: 'search', msg: `Retrieving recycling partner registry and press announcements...` },
      { status: 'alert', msg: `Partnership scan complete. Current partner status: ${oem.recycling_partner}.` },
      { status: 'success', msg: `EPR Target Analysis complete. Compiling final MiniMines Actionable Pitch report...` }
    ];

    try {
      // Print logs sequentially to simulate reasoning
      await printLogsSequentially(logs);
      
      // Render detailed pitch report
      renderReport(oem);
    } catch (error) {
      console.error(error);
      addLogEntry('alert', 'System agent failed to execute search query.');
      consoleSpinner.style.display = 'none';
    }
  }

  // Helper to delay
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Print console logs with delay
  async function printLogsSequentially(logs) {
    for (const log of logs) {
      addLogEntry(log.status, log.msg);
      consoleLogs.scrollTop = consoleLogs.scrollHeight;
      await sleep(650);
    }
    consoleSpinner.style.display = 'none';
    await sleep(400); // Small pause before switching to report
  }

  function addLogEntry(status, msg) {
    const div = document.createElement('div');
    div.className = `log-entry ${status}`;
    
    let prefix = '[INFO]';
    if (status === 'search') prefix = '[SEARCHING]';
    if (status === 'success') prefix = '[FOUND]';
    if (status === 'alert') prefix = '[ATTENTION]';
    
    div.innerText = `${prefix} ${msg}`;
    consoleLogs.appendChild(div);
  }

  // Generate and render report
  function renderReport(oem) {
    agentConsole.style.display = 'none';
    agentReport.style.display = 'block';

    reportTitle.innerHTML = `Sourcing & EPR Analysis: <strong>${oem.name}</strong>`;

    const eprTargetRate = oem.sector.includes('EV') || oem.sector.includes('Portable') ? 0.80 : 0.60;
    const imports = oem.imports_2025;
    const target = imports * eprTargetRate;
    
    // Lead evaluation
    const score = window.AppController ? window.AppController.calculateLeadScore(oem) : 50;
    let classification = '';
    let recommendation = '';

    if (oem.recycling_partner === 'None') {
      classification = '<span class="badge badge-priority-high">Low-Hanging Fruit (Prime Target)</span>';
      recommendation = `This OEM currently has **no public or exclusive battery recycling partner** to fulfill their CPCB liabilities. They are importing cells at a rate of **${imports.toFixed(1)} Tons/year**, giving them an EPR compliance target of **${target.toFixed(1)} Tons** for the upcoming assessment cycle. They are highly motivated to sign a collection and processing agreement to avoid Environmental Compensation penalties.`;
    } else if (oem.recycling_partner === 'In-talks') {
      classification = '<span class="badge badge-priority-med">Negotiation Target</span>';
      recommendation = `This OEM is in discussions but has not finalized a closed-loop recycling contract. Their EPR target is **${target.toFixed(1)} Tons**. MiniMines should leverage its Bengaluru Giga Critical Minerals Refining Complex capacity to offer better pricing/yield offsets than traditional mechanical recyclers.`;
    } else {
      classification = '<span class="badge badge-priority-low">Synergized / Locked Target</span>';
      recommendation = `This OEM is partnered with a recycling initiative (likely internal or long-term contract). However, their massive cell imports (**${imports.toFixed(1)} Tons**) mean they may seek secondary refiners for high-purity mineral extraction or chemical processes that their primary partner lacks.`;
    }

    // MiniMines recovery potential
    const isLfp = oem.chemistry.includes('LFP');
    const metalYieldRate = isLfp ? 0.014 : 0.15; // NMC recovers Ni+Co+Mn+Li, LFP recovers Li
    const estimatedCertificates = target * metalYieldRate * 0.99;

    let metalDetails = '';
    if (isLfp) {
      metalDetails = `*   **Lithium Carbonate equivalent:** ~${(target * 0.014 * 5.32).toFixed(1)} Tons of battery-grade Li₂CO₃ can be returned to their supply chain.`;
    } else {
      metalDetails = `*   **High-Purity Nickel & Cobalt:** ~${(target * 0.10).toFixed(1)} Tons can be recovered via MiniMines HHM™ process.
*   **Lithium Carbonate equivalent:** ~${(target * 0.015 * 5.32).toFixed(1)} Tons can be refined.`;
    }

    const contactName = oem.contact_person || 'Procurement Officer';
    const contactEmail = oem.email || 'info@oem.com';

    reportContent.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong>Sourcing Sector:</strong> ${oem.sector} | <strong>Chemistry:</strong> ${oem.chemistry}
      </div>
      
      <div style="margin-bottom: 16px;">
        <strong>EPR Target Classification:</strong> ${classification}
      </div>

      <h3>Strategic Summary</h3>
      <p style="margin-bottom: 12px;">${recommendation}</p>

      <h3>MiniMines Closed-Loop Potential</h3>
      <p style="margin-bottom: 8px;">If MiniMines secures 100% of this OEM's waste battery feed: </p>
      <ul>
        <li>We can generate up to **${estimatedCertificates.toFixed(1)} Tons** of EPR Certificates for their CPCB portal compliance.</li>
        ${metalDetails}
        <li><strong>HHM™ Efficiency Offset:</strong> Recovering 99% of materials reduces their raw material import dependency by up to **15%** upon cell plant commercialization.</li>
      </ul>

      <h3>Primary Contact Details</h3>
      <p style="margin-bottom: 12px;">
        Name: <strong>${contactName}</strong><br>
        Email: <a href="mailto:${contactEmail}" style="color: var(--accent-cyan);">${contactEmail}</a>
      </p>

      <div class="pitch-box">
        <strong>Recommended MiniMines Pitch:</strong><br>
        "Hi ${contactName.split(' ')[0]}, this is the Sourcing Team from MiniMines. We analyzed your cell import volumes under HSN 85076000 and calculate your FY25 EPR target at ${target.toFixed(1)} Tons. Our Bengaluru Giga complex can process your NMC/LFP waste with our patented Hybrid Hydrometallurgy™ process, returning 99% high-purity lithium back to your supply chain while issuing verified CPCB EPR credits."
      </div>
    `;
  }

  function resetAgentPanel() {
    agentReport.style.display = 'none';
    agentConsole.style.display = 'none';
    agentIntro.style.display = 'block';
  }

  // Export to window
  window.AgentRunner = {
    triggerAgentQuery
  };
});
