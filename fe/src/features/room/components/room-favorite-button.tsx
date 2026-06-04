import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { USER_ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'
import {
  useAddRoomFavorite,
  useCheckRoomFavorite,
  useRemoveRoomFavorite,
} from '../hooks/use-rooms'

type RoomFavoriteButtonProps = {
  roomId: string
}

export function RoomFavoriteButton({ roomId }: RoomFavoriteButtonProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userRole = useAuthStore((state) => state.user?.role)
  const canUseFavorites = Boolean(accessToken) && userRole === USER_ROLES.TENANT

  if (!canUseFavorites) {
    return null
  }

  return <TenantRoomFavoriteButton roomId={roomId} />
}

function TenantRoomFavoriteButton({ roomId }: RoomFavoriteButtonProps) {
  const favoriteQuery = useCheckRoomFavorite(roomId)
  const addFavorite = useAddRoomFavorite()
  const removeFavorite = useRemoveRoomFavorite()
  const isFavorited = favoriteQuery.data?.isFavorited ?? false
  const isFavoritePending =
    favoriteQuery.isFetching || addFavorite.isPending || removeFavorite.isPending

  function handleToggleFavorite() {
    if (isFavorited) {
      removeFavorite.mutate(roomId)
      return
    }

    addFavorite.mutate(roomId)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isFavorited ? 'Bo luu phong yeu thich' : 'Luu phong yeu thich'}
      aria-pressed={isFavorited}
      disabled={isFavoritePending}
      onClick={handleToggleFavorite}
      className="absolute right-3 top-3 z-10 bg-white/90 text-foreground shadow-sm hover:bg-white"
    >
      <Heart
        className={`size-5 ${
          isFavorited ? 'fill-red-500 text-red-500' : 'text-foreground'
        }`}
      />
    </Button>
  )
}
