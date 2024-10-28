import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import styled from "styled-components";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AddIcon from "@mui/icons-material/Add";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  defaultServings: number;
  currentServings: number;
}

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  min-height: 100vh;
`;

const StyledCard = styled(Card)`
  && {
    margin: 1rem 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    transition: transform 0.2s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
  }
`;

const Title = styled(Typography)`
  && {
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    font-weight: bold;
    margin-bottom: 2rem;
  }
`;

const ServingsControl = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

function App() {
  const [recipes, setRecipes] = useLocalStorageState<Recipe[]>("recipes", {
    defaultValue: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: 0,
    name: "",
    ingredients: [],
    instructions: "",
    defaultServings: 4,
    currentServings: 4,
  });

  useEffect(() => {
    if (recipes.length === 0) {
      const boilerplateRecipes: Recipe[] = [
        {
          id: 1,
          name: "Classic Spaghetti Carbonara",
          ingredients: [
            { name: "Spaghetti", amount: 400, unit: "g" },
            { name: "Eggs", amount: 4, unit: "pcs" },
            { name: "Pecorino Romano", amount: 100, unit: "g" },
            { name: "Guanciale", amount: 200, unit: "g" },
          ],
          instructions: "1. Cook pasta\n2. Mix eggs with cheese\n3. Fry guanciale\n4. Combine all ingredients",
          defaultServings: 4,
          currentServings: 4,
        },
        {
          id: 2,
          name: "Chicken Tikka Masala",
          ingredients: [
            { name: "Chicken breast", amount: 600, unit: "g" },
            { name: "Yogurt", amount: 200, unit: "ml" },
            { name: "Tomato sauce", amount: 400, unit: "ml" },
            { name: "Spices", amount: 30, unit: "g" },
          ],
          instructions: "1. Marinate chicken\n2. Grill chicken\n3. Prepare sauce\n4. Combine",
          defaultServings: 4,
          currentServings: 4,
        },
        // Add more boilerplate recipes...
      ];
      setRecipes(boilerplateRecipes);
    }
  }, [recipes, setRecipes]);

  const getScaledIngredients = (recipe: Recipe): Ingredient[] => {
    const ratio = recipe.currentServings / recipe.defaultServings;
    return recipe.ingredients.map(ing => ({
      ...ing,
      amount: Number((ing.amount * ratio).toFixed(2))
    }));
  };

  const handleUpdateServings = (id: number, newServings: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id 
        ? { ...recipe, currentServings: newServings }
        : recipe
    ));
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe(recipe);
    setIsDialogOpen(true);
  };

  const handleSaveRecipe = () => {
    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? newRecipe : r));
    } else {
      setRecipes([...recipes, { ...newRecipe, id: Date.now() }]);
    }
    setIsDialogOpen(false);
    setEditingRecipe(null);
    setNewRecipe({
      id: 0,
      name: "",
      ingredients: [],
      instructions: "",
      defaultServings: 4,
      currentServings: 4,
    });
  };

  return (
    <AppContainer>
      <Title variant="h3">
        <RestaurantIcon sx={{ fontSize: 40, marginRight: 2 }} />
        Recipe Book
      </Title>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setIsDialogOpen(true)}
        sx={{ marginBottom: 3, background: '#4ecdc4' }}
      >
        Add New Recipe
      </Button>

      {recipes.map((recipe) => (
        <StyledCard key={recipe.id}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {recipe.name}
            </Typography>
            
            <ServingsControl>
              <Typography>Servings:</Typography>
              <TextField
                type="number"
                value={recipe.currentServings}
                onChange={(e) => handleUpdateServings(recipe.id, Number(e.target.value))}
                size="small"
                sx={{ width: 100 }}
                inputProps={{ min: 1 }}
              />
            </ServingsControl>

            <Typography variant="h6">Ingredients:</Typography>
            <List>
              {getScaledIngredients(recipe).map((ing, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${ing.name}: ${ing.amount} ${ing.unit}`}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6">Instructions:</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {recipe.instructions}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <IconButton onClick={() => handleEditRecipe(recipe)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteRecipe(recipe.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </StyledCard>
      ))}

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
        </DialogTitle>
        <DialogContent>
          {/* Add form fields for recipe editing/creation */}
          {/* This is a simplified version - you might want to add more fields */}
          <TextField
            fullWidth
            label="Recipe Name"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Instructions"
            value={newRecipe.instructions}
            onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRecipe} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default App;
