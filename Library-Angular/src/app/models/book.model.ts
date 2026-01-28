// Interface completa do livro (vem da BD)
export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;              
  category: string;
  cover_image?: string | null; 
  total_copies: number;       
  available_copies: number;   
  created_at?: string | null;         
}

export interface CreateBookDto {
  title: string;
  author: string;
  year: number;
  category: string;
  cover_image?: string | null; 
  total_copies?: number;       

}

export interface UpdateBookDto {
  id: number;
  title?: string;
  author?: string;
  year?: number;
  category?: string;
  cover_image?: string | null;
  total_copies?: number;
  available_copies?: number;
}