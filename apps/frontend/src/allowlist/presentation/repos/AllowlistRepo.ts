import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export default interface AllowlistRepo {
    fetchAllowlistUserByAddress(address: string): Promise < AllowlistUserEntity >;
    fetchTotalListedUsers(allowlistId: string): Promise < number >;
}
