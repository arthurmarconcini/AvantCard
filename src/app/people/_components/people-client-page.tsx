"use client";

import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Eye, CreditCard, Banknote, Search, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { AddPersonModal } from "./add-person-modal";
import { DeletePersonModal } from "./delete-person-modal";
import { PersonDetailsModal } from "./person-details-modal";

interface Person {
  id: string;
  name: string;
  relationshipType: "FAMILY" | "FRIEND" | "OTHER";
  phone: string | null;
  email: string | null;
  notes: string | null;
  loanedLimit: number;
  loanedMoney: number;
  transactionCount: number;
  loanCount: number;
  loans: {
    id: string;
    principalAmount: number;
    startDate: Date;
    status: string;
    schedules: { id: string; dueDate: Date; totalDue: number; status: string }[];
  }[];
}

interface PeopleClientPageProps {
  initialPeople: Person[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  totalLoanedLimit: number;
  totalLoanedMoney: number;
}

const mapRelationshipToLabel = {
  FAMILY: "Família",
  FRIEND: "Amigo(a)",
  OTHER: "Outro"
};

export function PeopleClientPage({
  initialPeople,
  currentPage,
  totalPages,
  totalCount,
  totalLoanedLimit,
  totalLoanedMoney,
}: PeopleClientPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<{id: string, name: string} | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [personToView, setPersonToView] = useState<Person | null>(null);

  // Filtro local rápido na página atual (sem nova requisição)
  const filteredPeople = initialPeople.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (person: Person) => {
    setPersonToEdit(person);
    setIsAddModalOpen(true);
  };

  const handleDelete = (person: Person) => {
    setPersonToDelete({ id: person.id, name: person.name });
    setIsDeleteModalOpen(true);
  };

  const handleView = (person: Person) => {
    setPersonToView(person);
    setIsDetailsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    router.push(`/people?page=${page}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Rede de <span className="text-primary">Pessoas</span></h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">
            Gerencie amigos e familiares para os quais você empresta seu limite de cartão de crédito ou dinheiro.
            <span className="text-zinc-500 ml-1">({totalCount} {totalCount === 1 ? "pessoa" : "pessoas"})</span>
          </p>
        </div>
        <Button 
          onClick={() => { setPersonToEdit(null); setIsAddModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold px-6 h-11 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Pessoa
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Limite Emprestado</p>
              <h2 className="text-2xl font-bold text-white">{formatCurrency(totalLoanedLimit)}</h2>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Dinheiro Emprestado</p>
              <h2 className="text-2xl font-bold text-white">{formatCurrency(totalLoanedMoney)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="relative z-10 flex items-center gap-3 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar pessoa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-white/5 focus-visible:ring-primary/20 text-white placeholder:text-zinc-600 h-10 w-full"
          />
        </div>
      </div>

      {/* People Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10">
             <Users className="h-12 w-12 text-zinc-600 mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Nenhuma pessoa encontrada</h3>
             <p className="text-sm text-zinc-400 max-w-sm text-center">
               Não há resultados para a sua busca ou você ainda não cadastrou ninguém.
             </p>
          </div>
        ) : (
          filteredPeople.map((person) => (
            <div key={person.id} className="group relative bg-zinc-900/60 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{person.name}</h3>
                  <Badge variant="secondary" className="bg-white/5 text-zinc-400 hover:bg-white/10 text-[10px] font-medium border-0">
                    {mapRelationshipToLabel[person.relationshipType]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleEdit(person)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => handleDelete(person)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-500">Limite</span>
                  <span className="font-semibold text-primary">{formatCurrency(person.loanedLimit)}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-zinc-500">Dinheiro</span>
                  <span className="font-semibold text-blue-500">{formatCurrency(person.loanedMoney)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-white/10 text-white hover:bg-white/5"
                  onClick={() => handleView(person)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-zinc-950 font-bold"
                  onClick={() => router.push(`/loans?newLoanPersonId=${person.id}`)}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Emprestar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="relative z-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {isAddModalOpen && (
        <AddPersonModal 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
          personToEdit={personToEdit || undefined} 
        />
      )}
      
      {isDeleteModalOpen && (
        <DeletePersonModal 
          open={isDeleteModalOpen} 
          onOpenChange={setIsDeleteModalOpen} 
          person={personToDelete} 
        />
      )}

      {isDetailsModalOpen && (
        <PersonDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          person={personToView}
        />
      )}
    </div>
  );
}
