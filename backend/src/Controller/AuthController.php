<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Firebase\JWT\JWT;


final class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods:['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse(['errors' => ['JSON invalide']], 400);
        }

        // 🔹 Normalisation email
        $data['email'] = isset($data['email']) ? strtolower(trim($data['email'])) : null;

        $inputConstraints = new Assert\Collection([
            'email' => [
                new Assert\NotBlank(['message' => 'L’email est obligatoire.']),
                new Assert\Email(['message' => 'Format d’email invalide.'])
            ],
            'password' => [
                new Assert\NotBlank(['message' => 'Le mot de passe est obligatoire.']),
                new Assert\Length([
                    'min' => 6,
                    'minMessage' => 'Le mot de passe doit contenir au moins {{ limit }} caractères.'
                ])
            ]
        ]);

        $errorsInput = $validator->validate($data, $inputConstraints);

        if (count($errorsInput) > 0) {
            $messages = [];
            foreach ($errorsInput as $error) {
                $messages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(['errors' => $messages], 400);
        }

        $existingUser = $em->getRepository(User::class)
            ->findOneBy(['email' => $data['email']]);

        if ($existingUser) {
            return new JsonResponse([
                'error' => 'Cet email est déjà utilisé.'
            ], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword(
            $passwordHasher->hashPassword($user, $data['password'])
        );

        $errorsEntity = $validator->validate($user);

        if (count($errorsEntity) > 0) {
            $messages = [];
            foreach ($errorsEntity as $error) {
                $messages[] = $error->getPropertyPath() . ': ' . $error->getMessage();
            }
            return new JsonResponse(['errors' => $messages], 400);
        }

        $em->persist($user);
        $em->flush();

        return new JsonResponse([
            'message' => 'Utilisateur créé avec succès'
        ], 201);
    }


    #[Route('/api/login', name: 'api_login', methods:['POST'])]
    public function login(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['email']) || empty($data['password'])) {
            return new JsonResponse(['error' => 'Email et mot de passe requis'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse(['error' => 'Mot de passe invalide'], 401);
        }

        $secretKey = $_ENV['JWT_SECRET'];
        $payload = [
            'sub' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'iat' => time(),
            'exp' => time() + 3600
        ];
        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        return new JsonResponse([
            'token' => $jwt
        ]);
    }

}
