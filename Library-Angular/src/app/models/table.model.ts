export interface TableAction {
  actionKey: string;       
  icon: string;           
  color: string;          
  tooltip: string;        
  show?: (row: any) => boolean; 
}

export interface TableStatus {
  text: string;
  colorClass: string;
}

export interface TableColumn {
  key: string;
  header: string;
  type: 'text' | 'status' | 'actions' | 'date'; 
  actions?: TableAction[];             
  formatStatus?: (row: any) => TableStatus, // Function to evaluate the status dynamically
  dateFormat?: string;
}