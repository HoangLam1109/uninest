import { handleLogoutAPI } from '@/api/authApi'
import { paths } from '@/routes/paths'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await handleLogoutAPI()
      localStorage.removeItem('userInfo')
      toast.success('Đăng xuất thành công')
      navigate(paths.home)
    } catch (error) {
      console.error('Logout error:', error)
      // Vẫn logout local dù API fail
      localStorage.removeItem('userInfo')
      navigate(paths.home)
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="w-full"
    >
      Đăng xuất
    </Button>
  )
}
