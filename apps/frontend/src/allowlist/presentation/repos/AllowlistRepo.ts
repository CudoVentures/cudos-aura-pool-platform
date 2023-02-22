import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export default interface AllowlistRepo {
    fetchAllowlistUserBySessionAccount(): Promise < AllowlistUserEntity >;
    fetchTotalListedUsers(): Promise < number >;
}
