import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export default interface AllowlistRepo {
    fetchAllowlistUserByAddress(allowlistId: string, address: string): Promise < AllowlistUserEntity >;
    fetchTotalListedUsers(allowlistId: string): Promise < number >;
}
