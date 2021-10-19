const axios  = require('axios')

describe('AUTENTICAÇÃO', () => {
    it('login: Deve fazer login e retornar uma mensagem de sucesso', async () => {
        const user = {
            login: "user",
            password: "000",
        }

        const response = await axios.post('http://localhost:3000/api/auth/login', user)
        expect(response.data).toBe('Login feito com sucesso')
    })
    it('login: Deve tentar fazer login e retornar um erro com usuário não encontrado', async () => {
        const user = {
            login: "not valid login",
            password: "000",
        }
        try {
            await axios.post('http://localhost:3000/api/auth/login', user)
        } catch (error) {
            expect(error.response.data).toBe('Usuário não encontrado')
        }

    })
    it('login: Deve tentar fazer login e retornar um erro com senha incorreta', async () => {
        const user = {
            login: "admin",
            password: "0001",
        }

        try {
            await axios.post('http://localhost:3000/api/auth/login', user)
        } catch (error) {
            expect(error.response.data).toBe('Senha incorreta')
        }
    })
    it('refresh token: Deve retornar um novo token', async ()=> {
        const user = {
            login: "admin",
            password: "000",
        }

        const responseLogin = await axios.post('http://localhost:3000/api/auth/login', user)
        const token = responseLogin.headers['set-cookie']
        const responseRefreshToken = await axios.get('http://localhost:3000/api/auth/refreshToken', { headers: { "cookie": token[1] } })

        expect(responseRefreshToken.headers['set-cookie'].includes('next-token')).toBeFalsy()
    })
    it('logout: Deve retornar o cabeçalho da requisição vazio', async ()=>{
        const user = {
            login: "admin",
            password: "000",
        }

        const responseLogin = await axios.post('http://localhost:3000/api/auth/login', user)
        const token = responseLogin.headers['set-cookie']
        const responseLogout = await axios.get('http://localhost:3000/api/auth/logout', { headers: { "cookie": token } })
        expect(responseLogout.headers['set-cookie']).toBeUndefined()
    })

})

describe('GRUPOS', () => {
    it('GET: Deve tentar acessar uma rota autenticada por GET e retorna erro 401', async () => {
        try {
            await axios.get('http://localhost:3000/api/users')
        } catch (error) {
            expect(error.response.status).toBe(401)
        }
    })
    it('GET: Deve tentar acessar uma rota autenticada com sucesso', async () => {
        const user = {
            login: "admin",
            password: "000",
        }

        const responseLogin = await axios.post('http://localhost:3000/api/auth/login', user)
        const token = responseLogin.headers['set-cookie']
        const response = await axios.get('http://localhost:3000/api/users', { headers: { "cookie": token } })
        
        expect(response.status).toBe(200)
    })
    it('POST: Deve tentar criar um usuário e retornar erro por não ter autorização de inserção', async () => {
        const user = {
            login: "teste",
            password: "teste",
        }   

        const login = await axios.post('http://localhost:3000/api/auth/login', { login: "user", password: "000"})
        const token = login.headers['set-cookie']
        try {
            await axios.post('http://localhost:3000/api/users', {user}, { headers: { "cookie": token } })
        } catch (error) {
            expect(error.response.status).toBe(403)
        }
        
    })
    it('POST: Deve criar um usuário com sucesso', async () => {
        const user = {
            login: "teste",
            password: "teste",
        }   

        const login = await axios.post('http://localhost:3000/api/auth/login', { login: "admin", password: "000"})
        const token = login.headers['set-cookie']
        const response = await axios.post('http://localhost:3000/api/users', {user}, { headers: { "cookie": token } })
        
        expect(response.status).toBe(200)
    })
    it('PUT: Deve tentar atualizar o nome do usuário e retornar erro', async () => {
        const user = {
            name: "atualizado",
        }   
        const login = await axios.post('http://localhost:3000/api/auth/login', { login: "user", password: "000"})
        const token = login.headers['set-cookie']
        try {
            await axios.put('http://localhost:3000/api/users?login=teste', {user}, { headers: { "cookie": token } })
        } catch (error) {
            expect(error.response.status).toBe(403)            
        }

    })
    it('PUT: Deve atualizar o nome do usuário com sucesso', async () => {
        const user = {
            name: "atualizado",
        }   
        const login = await axios.post('http://localhost:3000/api/auth/login', { login: "admin", password: "000"})
        const token = login.headers['set-cookie']
        const response = await axios.put('http://localhost:3000/api/users?login=teste', {user}, { headers: { "cookie": token } })

        expect(response.data.name).toBe('atualizado')
    })

    // it('DELETE: Deve deletar um usuário e receber erro de não permitido', async () => {
    //     const login = await axios.post('http://localhost:3000/api/auth/login', { login: "user", password: "000"})
    //     const token = login.headers['set-cookie']
        
    //     try {
    //         await axios.delete('http://localhost:3000/api/users?login=teste', {headers: { "cookie": token } } )
    //     } catch (error) {
    //         expect(error.response.status).toBe(403)
    //     }
        
    // })
    // it('DELETE: Deve deletar um usuário com sucesso', async () => {
    //     const login = await axios.post('http://localhost:3000/api/auth/login', { login: "admin", password: "000"})
    //     const token = login.headers['set-cookie']
        
    //     const response = await axios.delete('http://localhost:3000/api/users?login=teste', {headers: { "cookie": token } } )
    //     expect(response.status).toBe(200)
        
    // })
})