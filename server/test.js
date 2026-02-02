import OpenAI from 'openai';
console.log('OpenAI imported successfully');
import express from 'express';
console.log('Express imported successfully');
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
console.log('pdf-parse imported successfully');
