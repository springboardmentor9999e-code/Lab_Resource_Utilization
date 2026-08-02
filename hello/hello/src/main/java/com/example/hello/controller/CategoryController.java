package com.example.hello.controller;

import com.example.hello.entity.Category;
import com.example.hello.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    @Autowired
    private CategoryService service;

    @GetMapping
    public List<Category> getAllCategories() {
        return service.getAllCategories();
    }

    @GetMapping("/{id}")
    public Category getCategory(@PathVariable Integer id) {
        return service.getCategoryById(id);
    }

    @PostMapping
    public Category addCategory(@RequestBody Category category) {
        return service.saveCategory(category);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Integer id,
                                   @RequestBody Category category) {

        category.setCategoryId(id);

        return service.saveCategory(category);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Integer id) {
        service.deleteCategory(id);
    }
}
