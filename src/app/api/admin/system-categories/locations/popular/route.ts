import { prisma } from "@/lib/prisma";
import { createAdminHandler, errorResponse, successResponse } from "@/middleware/admin-auth";
import { LocationType } from "@/types";

// GET popular cities (for quick selection)
export const  GET =  createAdminHandler(async (req, context) => {
    try {
      // Get top cities by job count or pre-defined list
      const popularCities = await prisma.location.findMany({
        where: {
          type: LocationType.CITY,
          isActive: true,
          OR: [
            { name: { in: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'] } }
          ]
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return successResponse(popularCities);
    } catch (error: any) {
      console.error('Get popular cities error:', error);
      return errorResponse(
        'FETCH_ERROR',
        error.message || 'Không thể lấy danh sách thành phố phổ biến',
        500
      );
    }
  })
