<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class JwtAuthenticator extends AbstractAuthenticator
{
    private $em;
    private $jwtSecret;

    public function __construct(EntityManagerInterface $em, string $jwtSecret)
    {
        $this->em = $em;
        $this->jwtSecret = $jwtSecret;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new AuthenticationException('No JWT token found');
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
        } catch (ExpiredException $e) {
            throw new AuthenticationException('Token expiré');
        } catch (\Exception $e) {
            throw new AuthenticationException('Token invalide');
        }

        $user = $this->em->getRepository(User::class)->find($decoded->sub);
        if (!$user) {
            throw new AuthenticationException('Utilisateur non trouvé.');
        }

        $userBadge = new UserBadge($user->getEmail(), fn($userIdentifier) => $user);

        return new SelfValidatingPassport($userBadge);
    }

    public function onAuthenticationSuccess(Request $request, $token, string $firewallName): ?JsonResponse
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?JsonResponse
    {
        return new JsonResponse(['error' => $exception->getMessage()], 401);
    }
}