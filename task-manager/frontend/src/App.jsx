import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  // =========================
  // State
  // =========================

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerError, setRegisterError] = useState('')

  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const [registerPage, setRegisterPage] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  // Controls which page is shown after login
  const [page, setPage] = useState('dashboard')


  // =========================
  // Get CSRF Cookie
  // =========================

  const getCsrfToken = async () => {
    await axios.get(API_URL + '/api/csrf/', {
      withCredentials: true
    })
  }


  // =========================
  // Register
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        API_URL + '/api/register/',
        {
          username: registerUsername,
          password: registerPassword
        }
      )

      console.log(response.data)

      setRegisterUsername('')
      setRegisterPassword('')
      setRegisterError('')

      setRegisterPage(false)

    } catch (error) {
      console.log('Register Error:', error.response)

      setRegisterError(
        error.response?.data?.error || 'Registration failed'
      )
    }
  }


  // =========================
  // Login
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await getCsrfToken()

      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      await axios.post(
        API_URL + '/api/login/',
        {
          username: username,
          password: password
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setLoggedIn(true)
      setError('')

    } catch (error) {
      console.log('Login error:', error.response)
      setError('Invalid username or password')
    }
  }


  // =========================
  // Add Task
  // =========================

  const handleAddTask = async (e) => {
    e.preventDefault()

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      const response = await axios.post(
        API_URL + '/api/tasks/',
        {
          title: title,
          description: description,
          category: category
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setTasks([...tasks, response.data])

      setTitle('')
      setDescription('')
      setCategory('')

      setPage('dashboard')

    } catch (error) {
      console.log('Add Task Error:', error.response)
    }
  }


  // =========================
  // Edit Task
  // =========================

  const handleEditTask = (task) => {
    setEditTaskId(task.id)

    setTitle(task.title)
    setDescription(task.description || '')
    setCategory(task.category || '')

    setPage('edit-task')
  }


  // =========================
  // Update Task
  // =========================

  const handleUpdateTask = async (e) => {
    e.preventDefault()

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      const response = await axios.put(
        API_URL + '/api/tasks/' + editTaskId + '/',
        {
          title: title,
          description: description,
          category: category
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setTasks(
        tasks.map(task =>
          task.id === editTaskId
            ? response.data
            : task
        )
      )

      setTitle('')
      setDescription('')
      setCategory('')
      setEditTaskId(null)

      setPage('dashboard')

    } catch (error) {
      console.log('Update Task Error:', error.response)
    }
  }


  // =========================
  // Delete Task
  // =========================

  const handleDeleteTask = async (taskId) => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      await axios.delete(
        API_URL + '/api/tasks/' + taskId + '/delete/',
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setTasks(
        tasks.filter(task => task.id !== taskId)
      )

    } catch (error) {
      console.log('Delete Task Error:', error.response)
    }
  }


  // =========================
  // Toggle Task Status
  // =========================

  const handleToggleStatus = async (task) => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      const response = await axios.patch(
        API_URL + '/api/tasks/' + task.id + '/',
        {
          completed: !task.completed
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setTasks(
        tasks.map(item =>
          item.id === task.id
            ? response.data
            : item
        )
      )

    } catch (error) {
      console.log('Status Update Error:', error.response)
    }
  }


  // =========================
  // Logout
  // =========================

  const handleLogout = async () => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]

      await axios.post(
        API_URL + '/api/logout/',
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      )

      setLoggedIn(false)
      setUsername('')
      setPassword('')
      setTasks([])
      setPage('dashboard')

    } catch (error) {
      console.log('Logout Error:', error.response)
    }
  }

const getCategoryName = (category) => {
  if (category === 1 || category === '1') {
    return 'Personal'
  }

  if (category === 2 || category === '2') {
    return 'Study'
  }

  if (category === 3 || category === '3') {
    return 'Office Work'
  }

  return 'Not selected'
}

  // =========================
  // Check Existing Login
  // =========================

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get(
          API_URL + '/api/current-user/',
          {
            withCredentials: true
          }
        )

        setUsername(response.data.username)
        setLoggedIn(true)

      } catch (error) {
        setLoggedIn(false)

      } finally {
        setCheckingSession(false)
      }
    }

    checkLogin()

  }, [])


  // =========================
  // Get Tasks After Login
  // =========================

  useEffect(() => {
    if (!loggedIn) {
      return
    }

    axios.get(
      API_URL + '/api/tasks/',
      {
        withCredentials: true
      }
    )
      .then(response => {
        setTasks(response.data)
      })
      .catch(error => {
        console.log('Task API Error:', error.response)
      })

  }, [loggedIn])


  // =========================
  // Loading Page
  // =========================

  if (checkingSession) {
    return (
      <div className="loading-page">
        <h2>Loading...</h2>
      </div>
    )
  }


  // =========================
  // Register Page
  // =========================

  if (!loggedIn && registerPage) {
    return (
      <div className="login-page">

        <div className="login-card">

          <h1>Create Account</h1>

          <p className="login-subtitle">
            Register to start managing your tasks
          </p>

          <form onSubmit={handleRegister}>

            <label>Username</label>

            <input
              type="text"
              value={registerUsername}
              onChange={(e) =>
                setRegisterUsername(e.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={registerPassword}
              onChange={(e) =>
                setRegisterPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="primary-button"
            >
              Register
            </button>

          </form>

          {registerError && (
            <p className="error-message">
              {registerError}
            </p>
          )}

          <div className="register-option">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => {
                setRegisterPage(false)
                setRegisterError('')
              }}
            >
              Login
            </button>

          </div>

        </div>

      </div>
    )
  }


  // =========================
  // Login Page
  // =========================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <h1>Task Manager</h1>

          <p className="login-subtitle">
            Login to manage your tasks
          </p>

          <form onSubmit={handleLogin}>

            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="primary-button"
            >
              Login
            </button>

          </form>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <div className="register-option">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() => {
                setRegisterPage(true)
                setError('')
              }}
            >
              Register
            </button>

          </div>

        </div>

      </div>
    )
  }


  // =========================
  // Add Task Page
  // =========================

  if (page === 'add-task') {
    return (
      <div className="app-container">

        <header className="top-header">

          <div className="logo">
            Task Manager
          </div>

          <button
            className="back-button"
            onClick={() => setPage('dashboard')}
          >
            ← Back to Dashboard
          </button>

        </header>

        <main className="content">

          <div className="page-heading">

            <h1>
              Add New Task
            </h1>

            <p>
              Create a new task and organize your work.
            </p>

          </div>

          <div className="form-card">

            <form onSubmit={handleAddTask}>

              <label>
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows="5"
              />

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >

                <option value="">
                  Select Category
                </option>

                <option value="1">
                  Personal
                </option>

                <option value="2">
                  Study
                </option>

                <option value="3">
                  Office Work
                </option>

              </select>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPage('dashboard')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Add Task
                </button>

              </div>

            </form>

          </div>

        </main>

      </div>
    )
  }


  // =========================
  // Edit Task Page
  // =========================

  if (page === 'edit-task') {
    return (
      <div className="app-container">

        <header className="top-header">

          <div className="logo">
            Task Manager
          </div>

          <button
            className="back-button"
            onClick={() => setPage('dashboard')}
          >
            ← Back to Dashboard
          </button>

        </header>

        <main className="content">

          <div className="page-heading">

            <h1>
              Edit Task
            </h1>

            <p>
              Update your task details.
            </p>

          </div>

          <div className="form-card">

            <form onSubmit={handleUpdateTask}>

              <label>
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
              />

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >

                <option value="">
                  Select Category
                </option>

                <option value="1">
                  Personal
                </option>

                <option value="2">
                  Study
                </option>

                <option value="3">
                  Office Work
                </option>

              </select>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPage('dashboard')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Update Task
                </button>

              </div>

            </form>

          </div>

        </main>

      </div>
    )
  }


  // =========================
  // Dashboard Statistics
  // =========================

  const totalTasks = tasks.length

  const completedTasks = tasks.filter(
    task => task.completed
  ).length

  const pendingTasks = tasks.filter(
    task => !task.completed
  ).length


  // =========================
  // Dashboard
  // =========================

  return (
    <div className="app-container">

      {/* Header */}

      <header className="top-header">

        <div className="logo">
          Task Manager
        </div>

        <div className="header-right">

          <div className="user-info">
            Welcome, {username}
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* Main Content */}

      <main className="content">

        {/* Welcome Section */}

        <section className="welcome-section">

          <h1>
            Welcome back!
          </h1>

          <p>
            Manage your tasks and stay organized.
          </p>

        </section>


        {/* Statistics Cards */}

        <section className="stats-container">

          <div className="stat-card">

            <span>
              Total Tasks
            </span>

            <strong>
              {totalTasks}
            </strong>

          </div>


          <div className="stat-card">

            <span>
              Pending
            </span>

            <strong>
              {pendingTasks}
            </strong>

          </div>


          <div className="stat-card">

            <span>
              Completed
            </span>

            <strong>
              {completedTasks}
            </strong>

          </div>

        </section>


        {/* My Tasks Section */}

        <section className="tasks-section">

          <div className="section-header">

            <div>

              <h2>
                My Tasks
              </h2>

              <p>
                View and manage your tasks
              </p>

            </div>

            <button
              className="primary-button"
              onClick={() => setPage('add-task')}
            >
              + Add Task
            </button>

          </div>


          {/* Task List */}

          {tasks.length === 0 ? (

            <div className="empty-state">

              <h3>
                No tasks yet
              </h3>

              <p>
                Start by creating your first task.
              </p>

              <button
                className="primary-button"
                onClick={() => setPage('add-task')}
              >
                + Add Your First Task
              </button>

            </div>

          ) : (

            <div className="task-list">

              {tasks.map(task => (

                <div
                  className="task-card"
                  key={task.id}
                >

                  <div className="task-main">

                    <div>

                      <h3>
                        {task.title}
                      </h3>

                      <p>
                        {task.description || 'No description'}
                      </p>

                    </div>


                    <span
                      className={
                        task.completed
                          ? 'status completed'
                          : 'status pending'
                      }
                    >
                      {task.completed
                        ? 'Completed'
                        : 'Pending'}
                    </span>

                  </div>


                  <div className="task-footer">

                    <div className="task-details">

                      <span>
                        Category: {getCategoryName(task.category)}
                      </span>


                      <span>
                        Task ID: #{task.id}
                      </span>

                    </div>


                    <div className="task-actions">

                      <button
                        className="status-button"
                        onClick={() => handleToggleStatus(task)}
                      >
                        {task.completed
                          ? 'Mark Pending'
                          : 'Mark Complete'}
                      </button>


                      <button
                        className="edit-button"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>


                      <button
                        className="delete-button"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default App
