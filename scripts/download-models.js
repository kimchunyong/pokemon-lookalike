import fs from 'fs'
import path from 'path'
import https from 'https'

const modelsDir = path.join(process.cwd(), 'public', 'models')
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
]

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}

const downloadFile = (filename) => {
  const fileUrl = `${baseUrl}/${filename}`
  const filePath = path.join(modelsDir, filename)

  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${filename} (already exists)`)
    return
  }

  console.log(`Downloading ${filename}...`)
  const file = fs.createWriteStream(filePath)

  https
    .get(fileUrl, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`Downloaded ${filename}`)
      })
    })
    .on('error', (err) => {
      fs.unlink(filename)
      console.error(`Error downloading ${filename}:`, err.message)
    })
}

models.forEach(downloadFile)
