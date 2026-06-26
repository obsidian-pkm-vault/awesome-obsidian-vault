import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'
import styles from '../styles/home.module.css'

export default function Home({ contentHtml }) {
  return (
    <div className={styles.container}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  )
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'AUTO305-OS-system-prompt.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')

  const processed = await remark().use(html).process(fileContents)
  const contentHtml = processed.toString()

  return { props: { contentHtml } }
}
