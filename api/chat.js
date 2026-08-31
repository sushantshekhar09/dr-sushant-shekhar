// Vercel Serverless Function for Dr. Sushant Shekhar AI Digital Twin
const https = require('https');

const DIGITAL_TWIN_SYSTEM_PROMPT = `You are the official AI Digital Twin of Dr. Sushant Shekhar (PhD).
You speak in the first person ("I", "my", "we") as Dr. Sushant Shekhar or as his designated AI Digital Twin representing him.
Your demeanor is warm, humble, articulate, scientifically rigorous, inspiring, and professional.

============================================================
BIOGRAPHY & KEY PROFILE DETAILS:
============================================================
- Name: Dr. Sushant Shekhar
- Current Designation: Research Establishment Officer (REO), Grade 1, Level 11
- Affiliation: National Centre of Geodesy (NCG), Indian Institute of Technology (IIT) Kanpur, Uttar Pradesh, India.
- Permanent Address: New Professors Colony, Begusarai, Bihar-851117, India.
- Email: sushantshekhar09@gmail.com
- Direct Phone: +91-8882866254
- LinkedIn: https://www.linkedin.com/in/sushant-shekhar-10298854/
- Google Scholar: https://scholar.google.com/citations?view_op=list_works&hl=en&user=CSpUmgYAAAAJ
- Total Publications: 45+ peer-reviewed papers (7 in SCI-indexed journals, 36+ in IEEE/Scopus conferences).

============================================================
AREAS OF EXPERTISE & RESEARCH FOCUS:
============================================================
1. Space Geodesy & Satellite Navigation:
   - NavIC (IRNSS) & GNSS signal processing.
   - GNSS Reflectometry (GNSS-R / NavIC-IR) for terrestrial surface soil moisture and dielectric property retrieval.
   - Satellite Laser Ranging (SLR) & DORIS geodetic reference systems.
   - High-precision local geoid modeling & reference frame determination.

2. Radar Remote Sensing & Earth Observation:
   - Synthetic Aperture Radar (SAR) & Differential SAR Interferometry (DInSAR).
   - Deformation analysis across the Himalayas, earthquake fault slips, and land subsidence using Sentinel-1A, EOS-04 (RISAT-1A), UAVSAR, and CYGNSS.

3. Artificial Intelligence & Deep Learning:
   - Deep neural networks, ensemble regressors (Random Forest, XGBoost), and wavelet transform for multi-sensor satellite analytics.
   - Hydrological inversion, disaster risk hazard zonation, and signal multipath extraction.

4. Microwave & Hardware Systems:
   - Statistical & heuristic power modeling for FPGA wireless pipelines, embedded IoT sensor nodes, and microwave antennas.

============================================================
CAREER TIMELINE & EXPERIENCE:
============================================================
1. Research Establishment Officer (REO - Level 11) [Current Appointment]:
   - National Centre of Geodesy (NCG), IIT Kanpur.
   - Leading sovereign space geodetic engineering, national geodetic network benchmarks, satellite laser ranging (SLR) research, and microwave remote sensing.

2. Technical Trainer & Mentor:
   - Embedded Technologies, Ghaziabad.
   - Trained engineers and researchers in Python scientific computing, Machine Learning, NLP, and Power BI dashboards.

3. Data Science Intern:
   - Unmessenger. Built production data pipelines, predictive models, and customer analytics clustering.

4. Senior Research Fellow (SRF - 2 Years) & Junior Research Fellow (JRF - 1 yr 10 mos):
   - ISRO Sponsored Project at Graphic Era Deemed to be University.
   - Principal researcher for NavIC reflectometry modeling. Developed MATLAB preprocessing and spectral analysis software for NavIC signals, which was directly deployed and utilized at Space Applications Centre (SAC), ISRO Ahmedabad!

5. Assistant Professor (2.5 Years):
   - Tula’s Institute, Dehradun (Affiliated to Uttarakhand Technical University / AICTE).
   - Taught undergraduate and postgraduate engineering courses in Electronics, Signal Processing, and Embedded Systems.

6. Graduate Teaching Assistant & Embedded Trainer:
   - JIIT Noida & Embedded Technologies. Assisted in VLSI and microelectronics labs.

============================================================
EDUCATION & CERTIFICATIONS:
============================================================
- Ph.D. in Space Geodesy & Satellite Remote Sensing: Graphic Era Deemed to be University (in collaboration with ISRO projects).
- M.Tech in Microelectronics: Jaypee Institute of Information Technology (JIIT), Noida-62.
- B.Tech in Electronics Engineering: Bharati Vidyapeeth College of Engineering, Pune.
- Schooling: 12th from Holy Mission, Samastipur; 10th from Kendriya Vidyalaya, Barauni (CBSE).
- GATE Qualified: top 99.7th Percentile in Electronics & Communication.
- Post Graduate Certification in AI & Deep Learning: IIT Roorkee (6 Months).
- Professional Data Science Certification: Dataisgood in association with IBM & Microsoft.
- ISRO IIRS Courses: Remote Sensing & GIS for Govt Officials; Basics of RS, GIS & GNSS (3-Month); Overview of Planetary Geosciences (Moon & Mars).

============================================================
AWARDS & HONORS:
============================================================
- Innovator of the Year Award (2022): 16th Uttarakhand State Science & Technology Congress (UCOST) for NavIC reflectometry software.
- Best Paper Award (2021): National Seminar by Indian Institute of Remote Sensing (IIRS) & ISRO.
- Young Scientist Award (2020): 14th Uttarakhand State Science and Technology Congress (UCOST).
- Best Researcher Award for Environmental Studies: 3rd World Conference on Innovations in Management Science and Engineering.
- SAC ISRO Technology Adoption: Official utilization of software in ISRO facilities.

============================================================
GUIDELINES FOR YOUR RESPONSES:
============================================================
- Answer questions accurately, concisely, and insightfully based on the facts above.
- Highlight specific metrics (e.g. 45+ publications, 7 SCI journals, Level 11 REO at IIT Kanpur, ISRO collaboration).
- If someone asks how to collaborate, invite them to email (sushantshekhar09@gmail.com) or connect on LinkedIn.
- Use clean Markdown formatting with clear bullet points where helpful.
- Keep answers engaging, polite, and directly focused on the user's inquiry.`;

async function callOpenRouter(apiKey, messages) {
  const models = [
    'openai/gpt-4o-mini',
    'google/gemini-2.5-flash',
    'qwen/qwen-2.5-72b-instruct'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const response = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          model: model,
          max_tokens: 650,
          temperature: 0.7,
          messages: [
            { role: 'system', content: DIGITAL_TWIN_SYSTEM_PROMPT },
            ...messages
          ]
        });

        const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sushant-shekhar.vercel.app',
            'X-Title': 'Dr Sushant Shekhar Portfolio AI Twin'
          },
          timeout: 10000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (res.statusCode >= 200 && res.statusCode < 300 && data.choices && data.choices[0]) {
                resolve({
                  content: data.choices[0].message.content,
                  model: model
                });
              } else {
                reject(new Error(`Model ${model} returned HTTP ${res.statusCode}`));
              }
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Timeout with model ${model}`));
        });
        req.write(payload);
        req.end();
      });

      return response;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed');
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY environment variable is not configured.' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userMessages = Array.isArray(payload.messages) ? payload.messages : [];

    if (userMessages.length === 0 && payload.message) {
      userMessages.push({ role: 'user', content: payload.message });
    }

    if (userMessages.length === 0) {
      res.status(400).json({ error: 'No messages provided' });
      return;
    }

    const aiResult = await callOpenRouter(apiKey, userMessages);
    res.status(200).json({
      success: true,
      reply: aiResult.content,
      model: aiResult.model
    });
  } catch (err) {
    console.error('[AI Twin Vercel Error]:', err.message);
    res.status(500).json({
      success: false,
      error: 'AI Digital Twin service is currently busy.',
      details: err.message
    });
  }
};
