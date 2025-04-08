import { BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import User from './pages/User'
import Sales from './pages/Sales'
import Login from './pages/Login'


const App = () => {
  return (
    
    <BrowserRouter>
    
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/user' element={<User/>}/>
      <Route path='/sales' element={<Sales/>}/>
      <Route path='/sign-in' element={<Login/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App