import { ITokenService, TokenPayload } from '../../domain/interfaces/token-service.interface';

export class IntrospectTokenUseCase {
  public constructor(private readonly tokenService: ITokenService) {}

  public async execute(input: { token: string }): Promise<{ isValid: boolean; payload: TokenPayload | null }> {
    const payload = await this.tokenService.verify(input.token);
    return {
      isValid: payload !== null,
      payload
    };
  }
}
