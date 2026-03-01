<?php

namespace App\Controller;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/my-tasks')]
class MyTasksController extends AbstractController
{
    #[Route('', methods:['GET'])]
    public function list(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();
        $tasks = $user->getTasks();

        $data = [];
        foreach ($tasks as $task) {
            $data[] = [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'date' => $task->getDate()?->format('Y-m-d H:i:s'),
                'hour' => $task->getHour()?->format('H:i'),
                'status' => $task->getStatus(),
            ];
        }

        return $this->json($data);
    }

    #[Route('', methods:['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {

        $this->denyAccessUnlessGranted('ROLE_USER');

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error'=>'JSON invalide'], 400);
        }

        if (empty($data['title'])) {
            return $this->json(['error'=>'Titre obligatoire'], 400);
        }

        $task = new Task();
        $task->setTitle(trim($data['title']));
        $task->setDescription($data['description'] ?? '');
        $task->setStatus($data['status'] ?? 'à faire');

        #date
        if (!empty($data['date'])) {
            if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $data['date'])) {
                return $this->json(['error' => 'Le format de date doit être jj/mm/aaaa'], 400);
            }

            try {
                $date = \DateTime::createFromFormat('d/m/Y', $data['date']);

                if (!$date) {
                    return $this->json(['error' => 'Format de date invalide'], 400);
                }

                $today = (new \DateTime())->setTime(0, 0, 0);
                $date->setTime(0, 0, 0);

                if ($date < $today) {
                    return $this->json(['error' => 'La date est déjà passé'], 400);
                }

                $task->setDate($date);

            } catch (\Exception) {
                return $this->json(['error' => 'Format de date invalide'], 400);
            }
        } else {
            $task->setDate(null);
        }

        #hour
        if (!empty($data['hour'])) {
            if (!preg_match('/^\d{2}:\d{2}$/', $data['hour'])) {
                return $this->json(['error' => 'Le format de l’heure doit être HH:MM'], 400);
            }

            try {
                $hour = \DateTime::createFromFormat('H:i', $data['hour']);
                if (!$hour) {
                    return $this->json(['error' => 'Format de l’heure invalide'], 400);
                }
                $task->setHour($hour);

            } catch (\Exception) {
                return $this->json(['error' => 'Format de l’heure invalide'], 400);
            }
        } else {
            $task->setHour(null);
        }

        $task->setUser($this->getUser());

        $errors = $validator->validate($task);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getPropertyPath().' : '.$error->getMessage();
            }
            return $this->json(['errors'=>$messages], 400);
        }

        $em->persist($task);
        $em->flush();

        return $this->json([
            'message'=>'Tâche créée',
            'id'=>$task->getId()
        ], 201);
    }

    #[Route('/{id}', methods:['PUT'])]
        public function update(
            ?Task $task,
            Request $request,
            EntityManagerInterface $em,
            ValidatorInterface $validator
        ): JsonResponse {

        $this->denyAccessUnlessGranted('ROLE_USER');

        if (!$task) {
            return $this->json(['error'=>'Tâche non trouvée'], 404);
        }

        if ($task->getUser() !== $this->getUser()) {
            return $this->json(['error'=>'Accès interdit'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error'=>'JSON invalide'], 400);
        }

        if (isset($data['title'])) {
            $task->setTitle(trim($data['title']));
        }

        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }

        if (array_key_exists('date', $data)) {
            if ($data['date'] === null || $data['date'] === '') {
                $task->setDate(null);
            } else {
                if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $data['date'])) {
                    return $this->json(['error' => 'Le format de date doit être jj/mm/aaaa'], 400);
                }

                $date = \DateTime::createFromFormat('d/m/Y', $data['date']);
                if (!$date) {
                    return $this->json(['error' => 'Format de date invalide'], 400);
                }

                $today = new \DateTime();
                $today->setTime(0,0,0);
                $date->setTime(0,0,0);

                if ($date < $today) {
                    return $this->json(['error' => 'La date est déjà passée'], 400);
                }

                $task->setDate($date);
            }
        }

        if (array_key_exists('hour', $data)) {
            if ($data['hour'] === null || $data['hour'] === '') {
                $task->setHour(null);
            } else {
                if (!preg_match('/^\d{2}:\d{2}$/', $data['hour'])) {
                    return $this->json(['error' => 'Le format de l’heure doit être HH:MM'], 400);
                }

                $hour = \DateTime::createFromFormat('H:i', $data['hour']);
                if (!$hour) {
                    return $this->json(['error' => 'Format de l’heure invalide'], 400);
                }

                $task->setHour($hour);
            }
        }

            $errors = $validator->validate($task);
            if (count($errors) > 0) {
                $messages = [];
                foreach ($errors as $error) {
                    $messages[] = $error->getPropertyPath().' : '.$error->getMessage();
                }
                return $this->json(['errors'=>$messages], 400);
            }

            $em->flush();

            return $this->json(['message'=>'Tâche mise à jour']);
    }

    #[Route('/{id}', methods:['DELETE'])]
    public function delete(
        ?Task $task,
        EntityManagerInterface $em
    ): JsonResponse {

        $this->denyAccessUnlessGranted('ROLE_USER');

        if (!$task) {
            return $this->json(['error'=>'Tâche non trouvée'], 404);
        }

        if ($task->getUser() !== $this->getUser()) {
            return $this->json(['error'=>'Accès interdit'], 403);
        }

        $em->remove($task);
        $em->flush();

        return $this->json(['message'=>'Tâche supprimée']);
    }
}