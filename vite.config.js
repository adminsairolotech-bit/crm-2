import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'ai-api-endpoints',
      configureServer(server) {

        server.middlewares.use('/api/buddy-chat', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { message, history } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });
            const systemPrompt = `You are "Buddy" — SAI RoloTech CRM ka AI Assistant. You help with:
- Sales & Lead Management (products: PLC Panels, HMI, SCADA, VFD, Servo Motors)
- Service & Troubleshooting (machine repairs, PLC errors, maintenance)
- Industrial Automation (PLC programming - Siemens, Allen Bradley, Mitsubishi, Omron, Delta)
- PNMG Loan Schemes (Personal/Business/Machinery/Home/Education loans)
- Machine Testing (15 test parameters for industrial panels)
- CRM Navigation help

Rules:
- Reply in Hinglish (Hindi + English mix) unless user speaks pure English
- Keep responses concise but helpful
- Use bullet points and formatting
- If user says "open X" or "go to X", tell them you'll navigate them there
- You represent SAI RoloTech company
- Be friendly and professional`;

            const contents = [];
            if (history && history.length > 0) {
              for (const h of history.slice(-10)) {
                contents.push({ role: h.from === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
              }
            }
            contents.push({ role: 'user', parts: [{ text: message }] });

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents,
              config: { systemInstruction: systemPrompt, maxOutputTokens: 1024, temperature: 0.7 }
            });
            const reply = response.text || 'Sorry, main samajh nahi paaya. Dobara try karein.';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, reply }));
          } catch (err) {
            console.error('Buddy chat error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/ai-quotation', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { clientName, clientPhone, clientEmail, clientCompany, products, budget, requirements, catalogData } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });

            const catalog = catalogData || {};
            const productList = (catalog.products || []).map(p =>
              `- ${p.name} (${p.category}): ₹${p.basePrice.toLocaleString('en-IN')}/${p.unit}, HSN: ${p.hsn}, Lead Time: ${p.leadTime}`
            ).join('\n');

            const systemPrompt = `You are a professional quotation generator for SAI RoloTech, an industrial automation company based in Pune, Maharashtra.

Company Info:
- Name: ${catalog.company?.name || 'SAI RoloTech'}
- Address: ${catalog.company?.address || 'MIDC Industrial Area, Pune'}
- Phone: ${catalog.company?.phone || '+91 98765 43210'}
- Email: ${catalog.company?.email || 'inquirysairolotech@gmail.com'}
- GSTIN: ${catalog.company?.gstin || '27AABCS1429B1Z1'}

Available Products & Pricing:
${productList || 'PLC Panels (₹28,000 - ₹85,000), HMI (₹18,000 - ₹32,000), VFD (₹8,500 - ₹22,000), SCADA (₹85,000), Servo Motors (₹35,000/set)'}

Payment Terms: ${catalog.terms?.payment || '50% advance, 50% before delivery'}
GST Rate: ${catalog.terms?.gst || 18}%
Warranty: ${catalog.terms?.warranty || '12 months'}
Delivery: ${catalog.terms?.delivery || 'Ex-works Pune'}

Generate a professional quotation in JSON format with this EXACT structure:
{
  "quotationNo": "SAI-YYYY-NNNN (current year, random 4 digit number)",
  "date": "current date in DD/MM/YYYY",
  "validUntil": "date 30 days from now in DD/MM/YYYY",
  "client": {
    "name": "client name",
    "phone": "client phone",
    "email": "client email or N/A",
    "company": "client company or individual"
  },
  "items": [
    {
      "sno": 1,
      "description": "product name and brief spec",
      "hsn": "HSN code",
      "qty": number,
      "unit": "unit",
      "unitPrice": number (without GST),
      "amount": number (qty × unitPrice)
    }
  ],
  "subtotal": number,
  "discount": number (percentage, 0-15 based on budget/qty),
  "discountAmount": number,
  "taxableAmount": number,
  "gstRate": 18,
  "gstAmount": number,
  "grandTotal": number,
  "paymentTerms": "${catalog.terms?.payment || '50% advance, 50% before delivery'}",
  "deliveryTerms": "${catalog.terms?.delivery || 'Ex-works Pune, freight extra'}",
  "warranty": "${catalog.terms?.warranty || '12 months on manufacturing defects'}",
  "notes": "2-3 lines of professional notes about the quotation",
  "executiveName": "Technical Sales Team"
}

Return ONLY valid JSON, no other text. Match products to client requirements intelligently.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: [{ role: 'user', parts: [{ text: `Generate quotation for:\nClient: ${clientName}\nPhone: ${clientPhone}\nEmail: ${clientEmail || 'N/A'}\nCompany: ${clientCompany || 'Individual'}\nProducts/Requirements: ${products}\nBudget: ${budget || 'Not specified'}\nSpecial Requirements: ${requirements || 'None'}` }] }],
              config: { systemInstruction: systemPrompt, maxOutputTokens: 2048, temperature: 0.3 }
            });

            let text = response.text || '{}';
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const quotation = JSON.parse(text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, quotation }));
          } catch (err) {
            console.error('AI Quotation error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/machine-guide', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { message, history } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });

            const systemPrompt = `You are "MASTER" — SAI RoloTech ka Roll Forming Machine Expert AI. Aap ek senior machine technician hain jo 20+ saal se roll forming machines pe kaam kar rahe hain.

Aapki expertise:
- Roll Forming Machines (Sheet Metal Profile Making)
- Coil Slitting, Decoiler, Straightener
- Forming Stations / Rollers / Tooling
- Punching Units (In-line punch press)
- Cut-off systems (Run length / Rotary die)
- PLC / HMI / Encoder / Servo systems
- Material handling (MS, SS, GI, PPGI, Aluminum)

COMMON ROLL FORMING MACHINE PROBLEMS AND SOLUTIONS:

1. PATTI LEFT JA RAHI HAI (Strip going left / Edge camber):
   Causes: Roll alignment off, material edge camber, side guide pressure uneven
   Solutions: Check side guides, align entry guide, check roll tooling alignment, adjust side guide pressure, check if material has edge camber

2. PATTI RIGHT JA RAHI HAI (Strip going right):
   Same as above but opposite side — check entry guide tilt, roll alignment

3. STRIP UPAR JA RAHI HAI / BOW UP (Strip bowing upward):
   Causes: Bottom roll gap too tight, material spring back, last station overpressed
   Solutions: Increase bottom roll gap, reduce forming pressure on last 2-3 stations, check material thickness consistency, add pressure roll at exit

4. STRIP NEECHE JA RAHI HAI / BOW DOWN (Strip bowing downward):
   Causes: Top roll gap too tight, too much downward pressure
   Solutions: Reduce top roll pressure, adjust gap uniformly, check straightener setting

5. PROFILE MEIN TWIST AA RAHA HAI (Profile twisting):
   Causes: Roll misalignment left-right, uneven material stress, asymmetric profile
   Solutions: Check shaft alignment, level all stations, check if tooling is worn, ensure equal roll pressure on both sides

6. PROFILE KE END MEIN FLARE / BELL MOUTH (Flaring at ends):
   Causes: Last station too aggressive, spring back not compensated
   Solutions: Add support rolls, adjust last station angle, use exit support table

7. WAVE / BUCKLE / WRINKLE (Tarangein ya shikanje):
   Causes: Roll gap too loose, material too thin for roll design, excess forming speed
   Solutions: Reduce speed, tighten roll gap progressively, check material thickness, add more forming stations

8. PROFILE KI DIMENSIONS GALAT HAIN:
   Causes: Roll wear, incorrect gap setting, wrong material thickness
   Solutions: Measure roll gap with feeler gauge, compare profile with drawing, check tooling wear

9. SURFACE PE MARKS / SCRATCHES:
   Causes: Dirty rolls, roll surface damage, no lubrication, debris in material
   Solutions: Clean all rolls with cloth, apply light oil, inspect roll surface, check material quality

10. CUTTING DIMENSION WRONG (Cut length galat):
    Causes: Encoder slip, encoder calibration off, PLC parameter wrong, material stretch
    Solutions: Re-calibrate encoder, check encoder coupling, adjust length factor in PLC, check pinch roll pressure

11. PUNCHING GALAT JAGAH HO RAHA HAI:
    Causes: Encoder error, punch trigger signal delay, material slipping in punch
    Solutions: Re-sync encoder, check pilot pin, adjust PLC punch timing, check clamp pressure

12. MACHINE MEIN VIBRATION / NOISE:
    Causes: Bearing damage, gear backlash, loose bolts, roll imbalance
    Solutions: Check all bearings, check gearbox oil, tighten all fasteners, inspect roll surface

13. MATERIAL SLIP HO RAHA HAI (Material slipping):
    Causes: Pinch roll pressure low, surface contamination, wrong roll surface
    Solutions: Increase pinch roll pressure, clean rolls, check roll surface condition

14. MOTOR OVERLOAD / TRIP HO RAHA HAI:
    Causes: Too much load, forming too aggressive, material too thick, mechanical jam
    Solutions: Reduce speed, check for jam, verify material thickness, adjust forming pressure

15. STRAIGHTENER SE MATERIAL SEEDHA NAHI AA RAHA:
    Causes: Straightener roll setting wrong, coil set too strong
    Solutions: Adjust straightener rolls, increase straightener pressure, check coil quality

REPLY RULES:
- Hamesha Hinglish mein jawab do (Hindi + English mix)
- Step-by-step numbered list format use karo
- Practical aur actionable advice do
- Agar problem unclear ho toh pehle clarifying questions poochho
- Safety warnings zaroor do jahan applicable ho
- "MASTER" ki tarah confident aur helpful raho
- Emojis use karo readability ke liye (🔧 ⚙️ ✅ ⚠️ 📏)
- Har response ke end mein poochho: "Kya aur help chahiye?"`;

            const contents = [];
            if (history && history.length > 0) {
              for (const h of history.slice(-12)) {
                contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
              }
            }
            contents.push({ role: 'user', parts: [{ text: message }] });

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents,
              config: { systemInstruction: systemPrompt, maxOutputTokens: 1500, temperature: 0.5 }
            });
            const reply = response.text || 'Sorry, kuch error aaya. Dobara try karein.';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, reply }));
          } catch (err) {
            console.error('Machine guide error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/generate-project-report', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { formData: f } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });

            const subsidyPct = ['SC','ST','OBC','Minority','Ex-Serviceman','Physically Handicapped'].includes(f.category) ? 35 : 25;
            const totalCost = parseFloat(f.totalProjectCost.replace(/,/g,'')) || 0;
            const loan = parseFloat(f.loanAmount.replace(/,/g,'')) || 0;
            const own = parseFloat(f.ownContribution.replace(/,/g,'')) || 0;
            const revenue = parseFloat(f.expectedRevenueMontly.replace(/,/g,'')) || 0;
            const rmCost = parseFloat(f.rawMaterialCostMonthly.replace(/,/g,'')) || 0;
            const labourCost = parseFloat(f.labourCostMonthly.replace(/,/g,'')) || 0;
            const overhead = parseFloat(f.overheadMonthly.replace(/,/g,'')) || 0;
            const interest = parseFloat(f.interestRate) || 11.5;
            const tenure = parseFloat(f.loanTenure) || 7;
            const monthlyEMI = loan * (interest/1200) * Math.pow(1+interest/1200, tenure*12) / (Math.pow(1+interest/1200, tenure*12) - 1);
            const monthlyProfit = revenue - rmCost - labourCost - overhead - monthlyEMI;
            const annualRevenue = revenue * 12;
            const annualProfit = monthlyProfit * 12;
            const breakEven = totalCost > 0 && monthlyProfit > 0 ? Math.ceil(totalCost / monthlyProfit) : 0;
            const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });

            const prompt = `Write a complete, professional project report in English for bank loan application under ${f.loanScheme} scheme. Use formal report language. Format with clear sections and subsections.

Applicant: ${f.applicantName}, Father: ${f.fatherName || 'N/A'}, DOB: ${f.dob || 'N/A'}, Category: ${f.category}
Qualification: ${f.qualification}, Experience: ${f.experience}
Address: ${f.address}, ${f.city}, ${f.state} - ${f.pincode}
Phone: ${f.phone}, Email: ${f.email}
Aadhaar: ${f.aadhaar || 'N/A'}, PAN: ${f.pan || 'N/A'}

Business Name: ${f.businessName}, Type: ${f.businessType}
Location: ${f.proposedLocation || f.city + ', ' + f.state}
Industry: ${f.industryType}, Loan Scheme: ${f.loanScheme}
Products: ${f.productDescription}
Target Market: ${f.targetMarket}

Machine: ${f.machineName} from ${f.machineSupplier}
Machine Cost: ₹${f.machinePrice}, Capacity: ${f.machineCapacity}
Land: ${f.landArea} sqft, Building Cost: ₹${f.buildingCost}
Other Equipment: ${f.otherEquipment}
Raw Material: ${f.rawMaterial}, Power: ${f.powerRequirement} kW
Total Employees: ${f.manpowerTotal} (Skilled: ${f.manpowerSkilled}), Working Days: ${f.workingDaysPerYear}/year

Total Project Cost: ₹${totalCost.toLocaleString('en-IN')}
Own Contribution: ₹${own.toLocaleString('en-IN')} (${totalCost > 0 ? Math.round(own/totalCost*100) : 0}%)
Bank Loan: ₹${loan.toLocaleString('en-IN')} (${totalCost > 0 ? Math.round(loan/totalCost*100) : 0}%)
Bank: ${f.bankName}, Tenure: ${tenure} years, Interest: ${interest}%
Monthly EMI: ₹${Math.round(monthlyEMI).toLocaleString('en-IN')}

Monthly Revenue: ₹${revenue.toLocaleString('en-IN')}
Monthly Raw Material: ₹${rmCost.toLocaleString('en-IN')}
Monthly Labour: ₹${labourCost.toLocaleString('en-IN')}
Monthly Overhead: ₹${overhead.toLocaleString('en-IN')}
Monthly Net Profit: ₹${Math.round(monthlyProfit).toLocaleString('en-IN')}
Annual Revenue: ₹${annualRevenue.toLocaleString('en-IN')}
Annual Net Profit: ₹${Math.round(annualProfit).toLocaleString('en-IN')}
Payback Period: ~${breakEven} months

Write a detailed project report with these sections (use proper formatting with section titles in capitals):

1. COVER PAGE INFO (Date: ${today}, Ref No: SAI-PR-${Date.now().toString().slice(-6)})
2. EXECUTIVE SUMMARY (3-4 paragraphs)
3. PROMOTER'S PROFILE (education, experience, family background)
4. PROJECT DESCRIPTION (products, manufacturing process with roll forming details)
5. MARKET ANALYSIS & DEMAND (demand for profiles in construction, infrastructure; competition; USP)
6. TECHNICAL DETAILS (machine specs, production capacity, infrastructure, power, manpower)
7. COST OF PROJECT (itemized table: Land & Building, Plant & Machinery, Working Capital, Misc)
8. MEANS OF FINANCE (own contribution, bank loan, ${f.loanScheme} subsidy if applicable: ${subsidyPct}% of project cost)
9. FINANCIAL PROJECTIONS - 5 YEAR PLAN (table format: revenue, expenses, profit year-wise, assume 70% capacity Y1, 80% Y2, 90% Y3-5)
10. REPAYMENT SCHEDULE (EMI: ₹${Math.round(monthlyEMI).toLocaleString('en-IN')}/month, ${tenure} years)
11. BREAK-EVEN ANALYSIS (fixed costs, variable costs, break-even point)
12. EMPLOYMENT GENERATION (total jobs: ${f.manpowerTotal || 'N/A'})
13. SOCIAL & ECONOMIC IMPACT
14. DECLARATION

Be thorough, professional and bank-ready. Include realistic numbers. Keep total report ~1200-1500 words.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: { maxOutputTokens: 4096, temperature: 0.3 }
            });
            const report = response.text || '';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, report }));
          } catch (err) {
            console.error('Project report error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/ai-machine-spec', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { form } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });

            const prompt = `You are a roll forming machine expert at SAI RoloTech, Pune.
Based on the following customer requirements, provide a brief technical machine specification estimate in Hinglish (Hindi+English).

Customer Requirements:
- Material: ${form.materialType}
- Thickness Range: ${form.minThickness}mm to ${form.maxThickness}mm
- Strip Width Range: ${form.minStripWidth}mm to ${form.maxStripWidth}mm
- Profile Height: ${form.profileHeight || 'Not specified'}mm
- Machine Type: ${form.machineType}
- Punching: ${form.punchingOption} ${form.punchingDetails || ''}
- Output Speed: ${form.outputSpeed || 'Not specified'} m/min
- Coil Weight: ${form.coilWeight || 'Not specified'} kg
- Cut Type: ${form.cutType || 'Not specified'}
- Control System: ${form.controlSystem || 'Not specified'}
- Special: ${form.specialRequirements || 'None'}

Give a 5-8 line technical estimate covering:
1. Estimated number of forming stations
2. Motor/drive requirements  
3. Frame/structure recommendations
4. Tooling material recommendation
5. Approximate machine size (L x W x H)
6. Any special technical notes
Keep it concise, practical and professional.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: { maxOutputTokens: 512, temperature: 0.3 }
            });
            const spec = response.text || '';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, spec }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/analyze-quotation', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { quotationText, catalogData } = JSON.parse(body);
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY });

            const catalog = catalogData || {};
            const saiPricing = (catalog.products || []).map(p =>
              `${p.name}: ₹${p.basePrice.toLocaleString('en-IN')}/${p.unit} (${p.category})`
            ).join('\n');

            const systemPrompt = `You are an expert industrial automation procurement analyst working for SAI RoloTech, Pune. You analyze quotations from any company and give a detailed, professional assessment.

SAI RoloTech Reference Pricing (for comparison):
${saiPricing || 'PLC Panels: ₹28,000-₹85,000, HMI: ₹18,000-₹32,000, VFD: ₹8,500-₹22,000, SCADA: ₹85,000, Servo: ₹35,000/set, Panels: ₹15,000+'}

Analyze the given quotation and return ONLY a valid JSON object with this EXACT structure:
{
  "companyName": "detected company name or 'Unknown Company'",
  "quotationRef": "quotation number if found or 'N/A'",
  "totalAmount": "total amount as string with ₹ or currency symbol, or 'N/A'",
  "overallScore": number between 1 and 10,
  "overallVerdict": "one of: Excellent | Good | Average | Below Average | Poor",
  "summary": "2-3 sentence executive summary in Hinglish",
  "pros": [
    { "point": "what is good", "detail": "brief explanation in Hinglish" }
  ],
  "cons": [
    { "point": "what is bad or missing", "detail": "brief explanation in Hinglish", "severity": "High | Medium | Low" }
  ],
  "priceAnalysis": {
    "verdict": "one of: Overpriced | Fair | Competitive | Cheap (quality risk)",
    "detail": "price comparison and analysis in Hinglish",
    "savingOpportunity": "estimated savings if switched to SAI RoloTech or better alternatives"
  },
  "missingItems": ["list of items that should be in a good quotation but are missing"],
  "redFlags": ["any suspicious or concerning items found"],
  "recommendations": ["3-5 actionable recommendations in Hinglish"],
  "sairolotech_advantage": "why SAI RoloTech would be better (1-2 lines)"
}

Be honest, specific, and helpful. If the text is not a quotation, still analyze what you can see.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: [{ role: 'user', parts: [{ text: `Analyze this quotation:\n\n${quotationText}` }] }],
              config: { systemInstruction: systemPrompt, maxOutputTokens: 2048, temperature: 0.4 }
            });

            let text = response.text || '{}';
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const analysis = JSON.parse(text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, analysis }));
          } catch (err) {
            console.error('Analyze Quotation error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/generate-questions', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { topic, count, qType } = JSON.parse(body);
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY });
            const prompt = `Generate exactly ${count || 5} ${qType === 'MCQ' ? 'multiple choice' : qType === 'Short' ? 'short answer' : 'mixed (MCQ and short answer)'} questions about "${topic || 'Industrial Automation, PLC, Electrical Safety, CRM Sales'}".

Context: These are for SAI RoloTech CRM - an industrial automation company dealing with PLC, HMI, SCADA, VFD, Servo Motors, Panel Manufacturing, Machine Testing, and CRM/Sales.

Return ONLY valid JSON array. Each question object must have:
- "q": question text (in Hinglish - Hindi+English mix)
- "a": correct answer
- "type": "MCQ" or "Short"
- "options": array of 4 options (only for MCQ type, include correct answer)

Example: [{"q":"PLC ka full form kya hai?","a":"Programmable Logic Controller","type":"MCQ","options":["Programmable Logic Controller","Power Logic Circuit","Program Level Control","Process Logic Computer"]}]

Return ONLY the JSON array, no other text.`;

            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
              max_tokens: 2000,
            });
            let text = completion.choices[0]?.message?.content || '[]';
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const questions = JSON.parse(text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, questions }));
          } catch (err) {
            console.error('Question gen error:', err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        async function getGmailClient() {
          const { google } = await import('googleapis');
          const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
          const xReplitToken = process.env.REPL_IDENTITY
            ? 'repl ' + process.env.REPL_IDENTITY
            : process.env.WEB_REPL_RENEWAL
            ? 'depl ' + process.env.WEB_REPL_RENEWAL
            : null;
          const connResp = await fetch(
            'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
            { headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken } }
          );
          const connData = await connResp.json();
          const conn = connData.items?.[0];
          const accessToken = conn?.settings?.access_token || conn?.settings?.oauth?.credentials?.access_token;
          if (!accessToken) throw new Error('Gmail not connected');
          const oauth2Client = new google.auth.OAuth2();
          oauth2Client.setCredentials({ access_token: accessToken });
          return google.gmail({ version: 'v1', auth: oauth2Client });
        }

        server.middlewares.use('/api/send-inquiry', async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405); res.end('Method not allowed'); return;
          }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { name, email, phone, message, source } = JSON.parse(body);
            const gmail = await getGmailClient();
            const INQUIRY_EMAIL = 'inquirysairolotech@gmail.com';
            const ADMIN_EMAIL = 'admin.sairolotech@gmail.com';
            const emailContent = [
              `From: CRM System <${INQUIRY_EMAIL}>`,
              `To: ${INQUIRY_EMAIL}`,
              `Cc: ${ADMIN_EMAIL}`,
              `Subject: New Lead Inquiry: ${name} (${source || 'Website'})`,
              `MIME-Version: 1.0`,
              `Content-Type: text/html; charset=utf-8`,
              ``,
              `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">`,
              `<h2 style="color:#667eea;border-bottom:2px solid #667eea;padding-bottom:10px;">New Lead Inquiry</h2>`,
              `<table style="width:100%;border-collapse:collapse;">`,
              `<tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${name}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>`,
              `<tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Source:</td><td style="padding:8px;">${source || 'Website Form'}</td></tr>`,
              `<tr><td style="padding:8px;font-weight:bold;">Message:</td><td style="padding:8px;">${message || 'No message'}</td></tr>`,
              `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Time:</td><td style="padding:8px;">${new Date().toLocaleString('en-IN')}</td></tr>`,
              `</table></div>`,
            ].join('\n');
            const encoded = Buffer.from(emailContent).toString('base64url');
            await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Inquiry sent successfully' }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        /* ── CRM: New Lead (Pabbly webhook) ──── */
        server.middlewares.use('/new-lead', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { name, phone, source, email } = JSON.parse(body || '{}');
            if (!phone) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Phone required' })); return; }
            const { createLead, scheduleFollowups } = await import('./server/models/leadModel.js').catch(() => ({}));
            const { enqueue } = await import('./server/services/queueService.js').catch(() => ({}));
            if (createLead) {
              const { existing, lead } = createLead({ name, phone, source: source || 'pabbly', email });
              if (!existing && enqueue) enqueue('SEND_WELCOME', { phone: lead.phone }, { delayMs: 2000 });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, duplicate: existing, leadId: lead.id }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, mock: true }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });

        /* ── CRM: App Tracking ──────────────── */
        server.middlewares.use('/api/track', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          try {
            let body = '';
            for await (const chunk of req) body += chunk;
            const { phone, event, fcmToken } = JSON.parse(body || '{}');
            if (!phone || !event) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'phone and event required' })); return; }
            const { getLead, updateLead, createLead, recalculateScore } = await import('./server/models/leadModel.js').catch(() => ({}));
            if (getLead) {
              let lead = getLead(phone) || createLead({ phone, name: 'App User', source: 'app' }).lead;
              const updates = {};
              if (event === 'download') updates.appInstalled = true;
              if (event === 'app_open') { updates.appOpened = true; if (fcmToken) updates.fcmToken = fcmToken; }
              if (['quotation', 'maintenance', 'quality'].includes(event)) updates.features = [...new Set([...(lead.features || []), event])];
              updateLead(phone, updates);
              const scored = recalculateScore(phone);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, score: scored?.score }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, mock: true }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });

        /* ── CRM: Admin — All Leads ─────────── */
        server.middlewares.use('/api/leads', async (req, res) => {
          if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
          const token = req.headers['x-admin-token'] || new URL(req.url, 'http://x').searchParams.get('token');
          const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN;
          if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Unauthorized' })); return; }
          try {
            const { getAllLeads, getStats } = await import('./server/models/leadModel.js').catch(() => ({}));
            if (getAllLeads) {
              const leads = getAllLeads();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, total: leads.length, leads, stats: getStats() }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, total: 0, leads: [] }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });

        /* ── CRM: Lead Stats (admin protected) ── */
        server.middlewares.use('/api/lead-stats', async (req, res) => {
          const token = req.headers['x-admin-token'] || new URL(req.url, 'http://x').searchParams.get('token');
          const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN;
          if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
          }
          try {
            const { getStats } = await import('./server/models/leadModel.js').catch(() => ({}));
            const stats = getStats ? getStats() : { total: 0 };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, stats }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, stats: { total: 0 } }));
          }
        });

        server.middlewares.use('/api/gmail-leads', async (req, res) => {
          try {
            const gmail = await getGmailClient();
            const labelsResp = await gmail.users.labels.list({ userId: 'me' });
            const labels = (labelsResp.data.labels || []).map(l => ({ id: l.id, name: l.name }));
            const inboxDetail = (await gmail.users.labels.get({ userId: 'me', id: 'INBOX' })).data;

            let leads = [];
            let emailsScanned = 0;
            let scanMethod = 'none';
            try {
              const msgList = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 50,
                q: 'in:inbox',
              });
              const messages = msgList.data.messages || [];
              emailsScanned = messages.length;
              scanMethod = 'full';
              for (const msg of messages.slice(0, 30)) {
                try {
                  const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date'],
                  });
                  const headers = detail.data.payload?.headers || [];
                  const from = headers.find(h => h.name === 'From')?.value || '';
                  const subject = headers.find(h => h.name === 'Subject')?.value || '';
                  const date = headers.find(h => h.name === 'Date')?.value || '';
                  const nameMatch = from.match(/^"?([^"<]+)"?\s*<?/);
                  const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s<]+@[^\s>]+)/);
                  const senderName = nameMatch ? nameMatch[1].trim() : from.split('@')[0];
                  const senderEmail = emailMatch ? emailMatch[1] : from;
                  const isLead = /inquiry|lead|quote|price|buy|order|interest|request|contact|help|service|product/i.test(subject)
                    || /inquiry|lead|quote|price|order|interest|request/i.test(from);
                  const isInternal = /sairolotech|noreply|no-reply|mailer-daemon|postmaster/i.test(senderEmail);
                  const labelIds = detail.data.labelIds || [];
                  const isUnread = labelIds.includes('UNREAD');
                  leads.push({
                    id: msg.id,
                    name: senderName,
                    email: senderEmail,
                    subject: subject,
                    date: date,
                    snippet: detail.data.snippet || '',
                    isLead,
                    isInternal,
                    isUnread,
                    status: isLead ? 'Hot Lead' : isInternal ? 'Internal' : 'New',
                    source: 'Gmail',
                  });
                } catch (e) {}
              }
              leads = leads.filter(l => !l.isInternal);
            } catch (readErr) {
              scanMethod = 'labels_only';
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              connected: true,
              email: 'inquirysairolotech@gmail.com',
              adminEmail: 'admin.sairolotech@gmail.com',
              labels,
              inbox: {
                total: inboxDetail.messagesTotal,
                unread: inboxDetail.messagesUnread,
              },
              leads,
              emailsScanned,
              scanMethod,
              totalLeads: leads.filter(l => l.isLead).length,
            }));
          } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message, leads: [], labels: [] }));
          }
        });

        // ─── Admin Control Panel API ────────────────────────────────────────
        // In-memory config + error log store (dev mode)
        const _cfg = {
          aiEnabled: true, aiModel: 'gemini-1.5-flash', whatsappEnabled: true,
          pushEnabled: true, followupEnabled: true, maintenanceMode: false,
          dailyMessageLimit: 100, alertOnError: true,
        };
        const _logs = [];
        const _stats = { aiCalls: 0, aiErrors: 0, whatsappSent: 0, whatsappFailed: 0, pushSent: 0, totalLeads: 0, followupsSent: 0, messagesToday: 0, startTime: Date.now() };
        // Daily reset at midnight
        const _midnightReset = () => { const n = new Date(); const ms = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5) - n; setTimeout(() => { _stats.messagesToday = 0; setInterval(() => { _stats.messagesToday = 0; }, 86400000); }, ms); };
        _midnightReset();

        function readBody(req) {
          return new Promise((resolve) => {
            let b = ''; req.on('data', c => b += c); req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
          });
        }

        function adminOk(req, res) {
          const TOKEN = process.env.ADMIN_API_TOKEN;
          if (!TOKEN) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'ADMIN_API_TOKEN not configured' })); return false; }
          const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'] || '';
          if (bearer !== TOKEN) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Unauthorized' })); return false; }
          return true;
        }

        function json(res, data, status = 200) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); }

        server.middlewares.use('/api/admin/verify', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          const TOKEN = process.env.ADMIN_API_TOKEN;
          if (!TOKEN) return json(res, { error: 'ADMIN_API_TOKEN not configured' }, 503);
          const body = await readBody(req);
          if (body.token === TOKEN) return json(res, { success: true });
          return json(res, { error: 'Invalid token' }, 401);
        });

        server.middlewares.use('/api/admin/config', async (req, res) => {
          if (!adminOk(req, res)) return;
          if (req.method === 'GET') return json(res, { ..._cfg });
          if (req.method === 'PATCH') {
            const body = await readBody(req);
            const allowed = ['aiEnabled','aiModel','whatsappEnabled','pushEnabled','followupEnabled','maintenanceMode','dailyMessageLimit','alertOnError'];
            for (const k of allowed) { if (k in body) _cfg[k] = body[k]; }
            return json(res, { ..._cfg });
          }
          res.writeHead(405); res.end();
        });

        server.middlewares.use('/api/admin/config/reset', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          if (!adminOk(req, res)) return;
          Object.assign(_cfg, { aiEnabled: true, aiModel: 'gemini-1.5-flash', whatsappEnabled: true, pushEnabled: true, followupEnabled: true, maintenanceMode: false, dailyMessageLimit: 100, alertOnError: true });
          return json(res, { ..._cfg });
        });

        server.middlewares.use('/api/admin/stats', async (req, res) => {
          if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
          if (!adminOk(req, res)) return;
          json(res, {
            stats: { ..._stats, uptimeSeconds: Math.floor((Date.now() - _stats.startTime) / 1000), errorCount: _logs.length },
            config: { ..._cfg },
            env: {
              whatsapp: !!process.env.WHATSAPP_ACCESS_TOKEN,
              fcm: !!process.env.FCM_SERVER_KEY,
              openrouter: !!process.env.OPENROUTER_API_KEY,
              gemini: !!process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
              adminToken: !!process.env.ADMIN_API_TOKEN,
            },
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
          });
        });

        server.middlewares.use('/api/admin/logs', async (req, res) => {
          if (req.method === 'GET') {
            if (!adminOk(req, res)) return;
            return json(res, { logs: _logs.slice(0, 50), total: _logs.length });
          }
          if (req.method === 'DELETE') {
            if (!adminOk(req, res)) return;
            _logs.length = 0;
            return json(res, { success: true, message: 'Logs cleared' });
          }
          res.writeHead(405); res.end();
        });

        server.middlewares.use('/api/admin/logs/test', async (req, res) => {
          if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
          if (!adminOk(req, res)) return;
          _logs.unshift({ id: Date.now(), ts: new Date().toISOString(), source: 'AdminPanel', message: 'Test error — manual trigger from Control Panel', details: 'System is working correctly.' });
          return json(res, { success: true, message: 'Test log entry added' });
        });

      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    watch: {
      ignored: ['**/.local/**', '**/node_modules/**'],
    },
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-router': ['wouter'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY ||
      process.env.FIRE_BASE_API_KEY ||
      process.env.GOOGLE_API_KEY || ''
    ),
  },
})
