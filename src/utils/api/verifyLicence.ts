// src/pages/api/verifyLicence.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'File missing or parsing failed' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath;
    const fileName = file.originalFilename ?? 'upload.jpg';

    try {
      const fileStream = fs.createReadStream(filePath);

      const formData = new FormData();
      formData.append('file', fileStream, fileName);
      formData.append('apikey', process.env.IDANALYZER_API_KEY ?? '');
      formData.append('outputformat', 'json');

      const response = await axios.post('https://api.idanalyzer.com/coreapi', formData, {
        headers: (formData as unknown as { getHeaders: () => Record<string, string> }).getHeaders(),
      });

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('IDAnalyzer Error:', (error as Error).message);
      return res.status(500).json({ error: 'Verification failed' });
    }
  });
}
