<?php

namespace App\Controller;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/admin/tasks')]
class AdminTaskController extends AbstractController
{
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $tasks = $em->getRepository(Task::class)->findAll();

        $data = [];
        foreach ($tasks as $task) {
            $data[] = [
                'id'=>$task->getId(),
                'title'=>$task->getTitle(),
                'user'=>$task->getUser()?->getEmail(),
                'status'=>$task->getStatus(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/{id}', methods:['DELETE'])]
    public function delete(Task $task, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $em->remove($task);
        $em->flush();

        return $this->json(['message'=>'Tâche supprimée par admin']);
    }
}