document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let oems = [];
  let selectedOemId = null;

  // DOM Elements
  const oemTableBody = document.getElementById('oem-table-body');
  const metricImports = document.getElementById('metric-imports');
  const metricLiability = document.getElementById('metric-liability');
  const metricLeads = document.getElementById('metric-leads');
  
  const filterSector = document.getElementById('filter-sector');
  const filterPartner = document.getElementById('filter-partner');
  
  // Calculator Elements
  const calcChemistry = document.getElementById('calc-chemistry');
  const calcWeight = document.getElementById('calc-weight');
  const btnCalculate = document.getElementById('btn-calculate');
  const calcResults = document.getElementById('calc-results');
  const metalsGrid = document.getElementById('metals-grid');
  const creditsValue = document.getElementById('credits-value');

  // File Upload Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const downloadSampleLink = document.getElementById('download-sample-link');

  // Initialize
  fetchOems();

  // Event Listeners
  filterSector.addEventListener('change', renderTable);
  filterPartner.addEventListener('change', renderTable);
  
  btnCalculate.addEventListener('click', calculateRecovery);
  downloadSampleLink.addEventListener('click', downloadSampleCSV);

  // Drag and Drop Events
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  // Load OEMs from localStorage or fall back to window.OEM_DATA
  function fetchOems() {
    try {
      const stored = localStorage.getItem('minmines_oems');
      if (stored) {
        oems = JSON.parse(stored);
      } else {
        oems = window.OEM_DATA || [];
        localStorage.setItem('minmines_oems', JSON.stringify(oems));
      }
      updateMetrics();
      renderTable();
    } catch (error) {
      console.error('Error loading OEM data:', error);
    }
  }

  // Save state to localStorage
  function saveOems() {
    localStorage.setItem('minmines_oems', JSON.stringify(oems));
    updateMetrics();
    renderTable();
  }

  // Update Global Dashboard Metrics
  function updateMetrics() {
    let totalImports = 0;
    let totalLiability = 0;
    let lowHangingFruits = 0;

    oems.forEach(oem => {
      totalImports += oem.imports_2025;
      
      // EPR Target: EV/Portable = 80% for FY 2025-26, Telecom/ESS = 60%
      const targetRate = oem.sector.includes('EV') || oem.sector.includes('Portable') ? 0.80 : 0.60;
      totalLiability += oem.imports_2025 * targetRate;

      if (oem.recycling_partner === 'None') {
        lowHangingFruits++;
      }
    });

    metricImports.innerText = `${Math.round(totalImports).toLocaleString()} Tons`;
    metricLiability.innerText = `${Math.round(totalLiability).toLocaleString()} Tons`;
    metricLeads.innerText = lowHangingFruits;
  }

  // Calculate Lead Score (0 - 100)
  function calculateLeadScore(oem) {
    let base = Math.min((oem.imports_2025 / 1500) * 50, 50); // Volume score up to 50
    let partnerScore = 0;

    if (oem.recycling_partner === 'None') {
      partnerScore = 50; // High score for no partner
    } else if (oem.recycling_partner === 'In-talks') {
      partnerScore = 30; // Medium score for active discussions
    } else if (oem.recycling_partner === 'Partnered') {
      partnerScore = 5;  // Low score for partnered
    }

    return Math.round(base + partnerScore);
  }

  // Render OEM table
  function renderTable() {
    oemTableBody.innerHTML = '';
    const sectorVal = filterSector.value;
    const partnerVal = filterPartner.value;

    const filtered = oems.filter(oem => {
      const matchesSector = sectorVal === 'all' || oem.sector === sectorVal;
      const matchesPartner = partnerVal === 'all' || oem.recycling_partner === partnerVal;
      return matchesSector && matchesPartner;
    });

    // Sort by Lead Score descending
    filtered.sort((a, b) => calculateLeadScore(b) - calculateLeadScore(a));

    filtered.forEach(oem => {
      const tr = document.createElement('tr');
      tr.dataset.id = oem.id;
      if (selectedOemId === oem.id) {
        tr.classList.add('selected');
      }

      const eprTargetRate = oem.sector.includes('EV') || oem.sector.includes('Portable') ? 0.80 : 0.60;
      const eprTarget = (oem.imports_2025 * eprTargetRate).toFixed(1);
      const score = calculateLeadScore(oem);

      // Determine priority badge
      let priorityClass = 'badge-priority-low';
      let priorityText = 'Low';
      if (score >= 75) {
        priorityClass = 'badge-priority-high';
        priorityText = 'High';
      } else if (score >= 45) {
        priorityClass = 'badge-priority-med';
        priorityText = 'Medium';
      }

      // Partner Status layout
      let partnerDotClass = 'none';
      if (oem.recycling_partner === 'Partnered') partnerDotClass = 'partnered';
      if (oem.recycling_partner === 'In-talks') partnerDotClass = 'in-talks';

      tr.innerHTML = `
        <td><strong>${oem.name}</strong></td>
        <td>${oem.sector}</td>
        <td><span class="badge badge-priority-low">${oem.chemistry}</span></td>
        <td>${oem.imports_2025.toFixed(1)}</td>
        <td>${eprTarget}</td>
        <td>
          <div class="partner-status">
            <span class="partner-dot ${partnerDotClass}"></span>
            <span>${oem.recycling_partner}</span>
          </div>
        </td>
        <td><span class="badge ${priorityClass}">${priorityText}</span></td>
        <td><span class="score-badge">${score}/100</span></td>
        <td><button class="btn btn-secondary btn-small select-oem-btn">Target</button></td>
      `;

      // Select OEM on click
      tr.addEventListener('click', (e) => {
        document.querySelectorAll('#oem-table tr').forEach(row => row.classList.remove('selected'));
        tr.classList.add('selected');
        selectedOemId = oem.id;
        
        if (window.AgentRunner) {
          window.AgentRunner.triggerAgentQuery(oem.id);
        }
      });

      oemTableBody.appendChild(tr);
    });
  }

  // Metal Recovery & Credit Estimations
  function calculateRecovery() {
    const weight = parseFloat(calcWeight.value || '0');
    const chemistry = calcChemistry.value;

    if (weight <= 0) return;

    let recoveryRates = {};
    if (chemistry === 'NMC 811') {
      recoveryRates = { Li: 0.015, Ni: 0.120, Co: 0.015, Mn: 0.015, Cu: 0.06, Al: 0.19 };
    } else if (chemistry === 'NMC 622') {
      recoveryRates = { Li: 0.015, Ni: 0.090, Co: 0.030, Mn: 0.030, Cu: 0.06, Al: 0.19 };
    } else if (chemistry === 'NMC 532') {
      recoveryRates = { Li: 0.015, Ni: 0.075, Co: 0.045, Mn: 0.030, Cu: 0.06, Al: 0.19 };
    } else if (chemistry === 'LFP') {
      recoveryRates = { Li: 0.014, Ni: 0.0, Co: 0.0, Mn: 0.0, Cu: 0.07, Al: 0.22 };
    }

    metalsGrid.innerHTML = '';
    let totalMetalsWeight = 0;

    Object.keys(recoveryRates).forEach(metal => {
      const rate = recoveryRates[metal];
      const metalWeight = weight * rate * 0.99; // 99% process efficiency
      totalMetalsWeight += metalWeight;

      if (rate > 0) {
        const div = document.createElement('div');
        div.className = 'metal-badge';
        div.innerHTML = `
          <span>${getMetalFullName(metal)} (${metal})</span>
          <strong>${metalWeight.toFixed(2)} T</strong>
        `;
        metalsGrid.appendChild(div);
      }
    });

    calcResults.style.display = 'block';
    
    // EPR Credits: equivalent to the weight of key active metals recovered
    let activeMetalsWeight = 0;
    if (chemistry.includes('NMC')) {
      activeMetalsWeight = weight * (recoveryRates.Li + recoveryRates.Ni + recoveryRates.Co + recoveryRates.Mn) * 0.99;
    } else {
      activeMetalsWeight = weight * recoveryRates.Li * 0.99;
    }
    
    creditsValue.innerText = `${activeMetalsWeight.toFixed(2)} Tons`;
  }

  function getMetalFullName(symbol) {
    const names = { Li: 'Lithium', Ni: 'Nickel', Co: 'Cobalt', Mn: 'Manganese', Cu: 'Copper', Al: 'Aluminium' };
    return names[symbol] || symbol;
  }

  // Handle uploaded File (Pure Client-Side Parsing)
  function handleFileSelect(e) {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }

  function processFile(file) {
    dropzone.innerHTML = `<div class="spinner"></div><p style="margin-top: 10px;">Parsing import logs client-side and updating targets...</p>`;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const csvText = event.target.result;
        const parsedRecords = parseCSV(csvText);
        
        const importTotals = {};
        parsedRecords.forEach(row => {
          const consignee = row.Consignee || row.consignee || '';
          if (!consignee) return;

          const weight = parseFloat(row.Weight_kg || row.weight || '0');
          const chemistry = row.Chemistry || row.chemistry || 'NMC 811';

          // Match consignee with existing OEMs
          let matchedOem = oems.find(o => 
            o.name.toLowerCase().includes(consignee.toLowerCase()) || 
            consignee.toLowerCase().includes(o.name.toLowerCase())
          );

          if (matchedOem) {
            if (!importTotals[matchedOem.id]) {
              importTotals[matchedOem.id] = { weight: 0, chemistry: chemistry };
            }
            importTotals[matchedOem.id].weight += weight;
          } else {
            // Add new OEM dynamically
            const newId = consignee.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const newOem = {
              id: newId,
              name: consignee,
              sector: consignee.toLowerCase().includes('motor') || consignee.toLowerCase().includes('auto') || consignee.toLowerCase().includes('electric') ? 'EV 2W' : 'Telecom / ESS',
              chemistry: chemistry,
              imports_2024: 0,
              imports_2025: 0,
              mwh_2025: 0,
              recycling_partner: 'None',
              cpcb_status: 'Registered',
              contact_person: 'Procurement Director',
              email: `procurement@${newId}.com`,
              notes: 'Added via imported customs log analysis.'
            };
            oems.push(newOem);
            importTotals[newId] = { weight: weight, chemistry: chemistry };
          }
        });

        // Update values: convert kg to Tons
        oems.forEach(o => {
          if (importTotals[o.id]) {
            const addedTons = importTotals[o.id].weight / 1000;
            o.imports_2025 = parseFloat((o.imports_2025 + addedTons).toFixed(2));
            const energyDensity = o.chemistry.includes('LFP') ? 0.125 : 0.160;
            o.mwh_2025 = parseFloat((o.imports_2025 * energyDensity).toFixed(2));
            o.chemistry = importTotals[o.id].chemistry;
          }
        });

        saveOems();
        resetDropzone(`Successfully parsed ${parsedRecords.length} records. Targeting Matrix updated!`);
      } catch (err) {
        console.error(err);
        resetDropzone('Failed to parse CSV file. Ensure columns match the sample format.');
      }
    };
    reader.onerror = function() {
      resetDropzone('Error reading file.');
    };
    reader.readAsText(file);
  }

  // Simple split-based CSV parser
  function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      records.push(obj);
    }
    return records;
  }

  function resetDropzone(msg) {
    dropzone.innerHTML = `
      <input type="file" id="file-input" accept=".csv" style="display: none;">
      <svg class="upload-icon" viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
      <p>${msg || 'Drag and drop your import CSV here, or <span class="file-trigger">browse files</span>'}</p>
    `;
    const newFileInput = document.getElementById('file-input');
    newFileInput.addEventListener('change', handleFileSelect);
  }

  // Generate and download sample CSV client-side
  function downloadSampleCSV(e) {
    e.preventDefault();
    const csvContent = `Date,Consignee,Shipper,Description,HSN,Weight_kg,Chemistry,Port
2025-01-10,Ola Electric Mobility Ltd,LG Energy Solution,Cylindrical Li-ion Cells 2170 NMC 811,85076000,45000,NMC 811,Chennai Sea
2025-01-15,Ather Energy Pvt Ltd,Samsung SDI,Li-ion Cells Cylindrical NMC 622,85076000,18000,NMC 622,Chennai Sea
2025-01-18,TVS Motor Company Ltd,Samsung SDI,Lithium Ion Cell NMC 532 3.2V,85076000,25000,NMC 532,Chennai Sea
2025-01-22,Coslight India Telecom Pvt Ltd,Coslight China,Lithium Iron Phosphate LFP cells,85076000,32000,LFP,Nhava Sheva Sea
2025-01-25,Mahindra & Mahindra Ltd,BYD Battery Co,Prismatic Lithium Cell LFP for EV packs,85076000,68000,LFP,Nhava Sheva Sea
2025-02-02,Ola Electric Mobility Ltd,LG Energy Solution,Cylindrical Li-ion Cells 2170 NMC 811,85076000,52000,NMC 811,Chennai Sea
2025-02-05,Ather Energy Pvt Ltd,Samsung SDI,Li-ion Cells Cylindrical NMC 622,85076000,22000,NMC 622,Chennai Sea
2025-02-12,Hero MotoCorp Ltd (Vida),LG Energy Solution,Cylindrical Cell NMC 811 for Vida pack,85076000,15000,NMC 811,Nhava Sheva Sea
2025-02-19,Greaves Electric Mobility (Ampere),Gotion Tech,LFP Prismatic Cells for electric 2W,85076000,12000,LFP,Chennai Sea
2025-02-22,BGauss Auto Pvt Ltd,EVE Energy Co,Lithium Cell LFP 3.2V 100Ah,85076000,8000,LFP,Nhava Sheva Sea`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_import_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export state
  window.AppController = {
    getOem: (id) => oems.find(o => o.id === id),
    calculateLeadScore: calculateLeadScore
  };
});
