import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

const hodDepartments = [
  'Mathematics',
  'Science',
  'Computer Science',
  'English',
  'Social Studies',
  'Commerce',
  'Languages',
  'Physical Education',
]

const teacherSubjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Telugu',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Economics',
  'Commerce',
  'History',
  'Geography',
  'Physical Education',
  'Art & Drawing',
]

function SchoolSubcategories() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'School'
  const profession = searchParams.get('profession') || 'Teacher'
  const items = profession === 'HOD' ? hodDepartments : teacherSubjects
  const title = profession === 'HOD' ? 'Select a department' : 'Select a subject'
  const breadcrumb = profession === 'HOD' ? 'Departments' : 'Subjects'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Schools</span>
        <h1>{organization}</h1>
        <p>{title}</p>

        <div className="hero-actions">
          <Link to={`/school-roles?organization=${encodeURIComponent(organization)}`} className="secondary-btn">
            Back to Roles
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {items.map((item) => (
          <article key={item} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{profession === 'HOD' ? '📚' : '📖'}</span>
            </div>

            <h2>{item}</h2>
            <p>
              {profession === 'HOD'
                ? 'Department selection for the relevant HOD.'
                : 'Subject selection for the right teacher.'}
            </p>

            <Link
              to={`/school-providers?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(profession)}&${profession === 'HOD' ? 'department' : 'subject'}=${encodeURIComponent(item)}`}
              className="category-button"
            >
              View Providers
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default SchoolSubcategories
