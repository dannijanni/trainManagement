using train_management_system.Models.Company;
using static train_management_system.DTO.trainDTO;

namespace train_management_system.DAL_Interface
{
    public interface ITrainDAL
    {
        Task<Guid> AddTrainAsync(AddTrainRequest request);
        Task UpdateTrainAsync(UpdateTrainRequest request);
        Task DeleteTrainAsync(Guid trainId);
        Task<Train?> GetTrainByIdAsync(Guid id);
        Task<List<Train>> GetAllTrainsAsync();

    }
}
