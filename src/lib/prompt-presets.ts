export type CoordinateFormat = 'pixels' | 'normalized_1000' | 'normalized_1000_yxyx' | 'normalized_1024_yxyx' | 'normalized_1' | 'yolo';

export interface PromptPreset {
	id: string;
	name: string;
	coordinateFormat: CoordinateFormat;
	coordinateDescription: string;
	template: string;
}

export const PROMPT_PRESETS: Record<string, PromptPreset> = {
	qwen3vl: {
		id: 'qwen3vl',
		name: 'Qwen3 VL',
		coordinateFormat: 'normalized_1000',
		coordinateDescription: 'Normalized 0-1000 [x1, y1, x2, y2]',
		template: `You are an AI assistant specialized in extracting structured data from product images and documents.

Instructions:
- Carefully analyze all visible text, labels, and visual elements in the image
- Extract data for each field according to its specific description and requirements
- Follow any format specifications, regex patterns, or allowed values exactly as defined
- If a value is not visible or cannot be determined, use null
- Pay attention to units, separators, and formatting requirements in field descriptions

Return only valid JSON in the exact format specified. Do not include explanations, notes, markdown formatting, or any additional text outside the JSON response.

--- FIELDS TO EXTRACT ---

IMPORTANT: If multiple images are provided, they show the SAME object from different angles or perspectives. Analyze ALL images together to extract comprehensive information. Each request becomes ONE row in the database.

For each field, provide:
- The extracted value (text from OCR or visual analysis like colors, shapes)
- Image index (0-based) indicating which image contains the information
- Bounding box [x1, y1, x2, y2] in normalized 0-1000 range showing where you found the information in that specific image
- Confidence score (0.0 to 1.0) indicating certainty

{{FIELDS}}

--- EXPECTED OUTPUT FORMAT ---

Return ONLY valid JSON in this exact structure:

{
  "extractions": [
{{FIELD_EXAMPLES}}
  ]
}

Important:
- Multiple images show the SAME object - combine information from all images into one extraction
- ONE bounding box per field ONLY - never provide multiple bounding boxes for the same field
- If the same information appears in multiple images (e.g., model number visible on both sides), use the image_index and bbox from the image where you have the HIGHEST confidence
- image_index must be 0-based (0 for first image, 1 for second image, etc.)
- bbox_2d coordinates should be normalized to 0-1000 range [x1, y1, x2, y2] marking the region in the specified image
- For OCR text: bbox should surround the text
- For visual features (colors, shapes): bbox should surround the analyzed region
- CRITICAL: If a field's information is NOT present in ANY of the provided images, set value to null, image_index to 0, bbox_2d to [0, 0, 0, 0], and confidence to 0.0
- Do NOT make up, guess, or infer information that is not visible in the images
- Do not include any explanations, notes, or text outside the JSON structure`
	},
	gemini2: {
		id: 'gemini2',
		name: 'Gemini 2.0',
		coordinateFormat: 'normalized_1000_yxyx',
		coordinateDescription: 'Normalized 0-1000 [y_min, x_min, y_max, x_max]',
		template: `You are an AI assistant specialized in extracting structured data from product images and documents.

Instructions:
- Carefully analyze all visible text, labels, and visual elements in the image
- Extract data for each field according to its specific description and requirements
- Follow any format specifications, regex patterns, or allowed values exactly as defined
- If a value is not visible or cannot be determined, use null
- Pay attention to units, separators, and formatting requirements in field descriptions

Return only valid JSON in the exact format specified. Do not include explanations, notes, markdown formatting, or any additional text outside the JSON response.

--- FIELDS TO EXTRACT ---

IMPORTANT: If multiple images are provided, they show the SAME object from different angles or perspectives. Analyze ALL images together to extract comprehensive information. Each request becomes ONE row in the database.

For each field, provide:
- The extracted value (text from OCR or visual analysis like colors, shapes)
- Image index (0-based) indicating which image contains the information
- Bounding box [y_min, x_min, y_max, x_max] in normalized 0-1000 range showing where you found the information in that specific image
- Confidence score (0.0 to 1.0) indicating certainty

{{FIELDS}}

--- EXPECTED OUTPUT FORMAT ---

Return ONLY valid JSON in this exact structure:

{
  "extractions": [
{{FIELD_EXAMPLES}}
  ]
}

Important:
- Multiple images show the SAME object - combine information from all images into one extraction
- ONE bounding box per field ONLY - never provide multiple bounding boxes for the same field
- If the same information appears in multiple images (e.g., model number visible on both sides), use the image_index and bbox from the image where you have the HIGHEST confidence
- image_index must be 0-based (0 for first image, 1 for second image, etc.)
- bbox_2d coordinates should be normalized to 0-1000 range [y_min, x_min, y_max, x_max] marking the region in the specified image (Y-first ordering)
- For OCR text: bbox should surround the text
- For visual features (colors, shapes): bbox should surround the analyzed region
- CRITICAL: If a field's information is NOT present in ANY of the provided images, set value to null, image_index to 0, bbox_2d to [0, 0, 0, 0], and confidence to 0.0
- Do NOT make up, guess, or infer information that is not visible in the images
- Do not include any explanations, notes, or text outside the JSON structure`
	}
};

export const DEFAULT_PROMPT_TEMPLATE = PROMPT_PRESETS.qwen3vl.template;

export function getPresetById(id: string): PromptPreset | null {
	return PROMPT_PRESETS[id] || null;
}

export function getAllPresets(): PromptPreset[] {
	return Object.values(PROMPT_PRESETS);
}
