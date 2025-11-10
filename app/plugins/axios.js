import axios from 'axios'

export default defineNuxtPlugin(() => {
	const instance = axios.create({
		baseURL: 'http://localhost:8000/',
	})

	// Request interceptor
	instance.interceptors.request.use(
		request => {
			if (process.client) {
				const token = localStorage.getItem('access_token')
				if (token) {
					request.headers.Authorization = `Bearer ${token}`
				}
			}
			return request
		},
		error => {
			return Promise.reject(error)
		}
	)

	// Response interceptor
	instance.interceptors.response.use(
		response => response,
		error => {
			if (process.client && error.response?.status === 403) {
				localStorage.removeItem('access_token')
				localStorage.removeItem('roles')
				localStorage.removeItem('user')
				// Можешь перенаправить пользователя, если хочешь
				// window.location.href = '/login'
			}
			return Promise.reject(error)
		}
	)

	return {
		provide: {
			axios: instance,
		},
	}
})
